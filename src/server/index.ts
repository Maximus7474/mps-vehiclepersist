import { GetVehicle, SpawnVehicle, OxVehicle } from "@overextended/ox_core/server";
import { oxmysql as MySQL } from '@overextended/oxmysql';
import { versionCheck, VehicleProperties } from '@overextended/ox_lib/server'
import { persistedVehicle } from "./types";

const dev = GetConvarInt('ox:debug', 0) === 1;
const doVersionCheck = GetConvarInt('persistvehicles:versioncheck', 1) === 1;
const DEBUG = (...args: any[]): void => { // eslint-disable-line
  if (!dev) return;
  console.log(`[^4${GetCurrentResourceName()}^7]`, ...args); // eslint-disable-line
};

const SaveAllVehicles = async () => {
  const vehicles = GetAllVehicles() as number[];

  let saved: number = 0;

  for (const entityId of vehicles) {
    const vehicle: OxVehicle = GetVehicle(entityId);

    if (!vehicle) continue;

    const coords: number[] = GetEntityCoords(entityId);
    const rotation: number[] = GetEntityRotation(entityId);

    const engineHealth: number = GetVehicleEngineHealth(entityId);
    const bodyHealth: number = GetVehicleBodyHealth(entityId);
    const tankHealth: number = GetVehiclePetrolTankHealth(entityId);

    const properties: VehicleProperties = vehicle.getProperties();
    if (properties.engineHealth !== engineHealth) {
      properties.engineHealth = engineHealth;
    }
    if (properties.bodyHealth !== bodyHealth) {
      properties.bodyHealth = bodyHealth;
    }
    if (properties.tankHealth !== tankHealth) {
      properties.tankHealth = tankHealth;
    }

    // Doesn't seem to always save all burst tyres
    const tyres: Record<number | string, 1 | 2> = {};
    for (let i = 0; i < 8; i++) {
      if (IsVehicleTyreBurst(entityId, i, false) || IsVehicleTyreBurst(entityId, i, true)) {
        tyres[i] = IsVehicleTyreBurst(entityId, i, true) ? 2 : 1;
      }
    }
    properties.tyres = tyres;

    // Not available from server
    // const windows: number[] = [];
    // for (let i = 0; i < 8; i++) {
    //   if (!IsVehicleWindowIntact(entityId, i)) windows.push(i);
    // }

    vehicle.setProperties(properties);

    if (engineHealth > 0) {
      try {
        await MySQL.insert('INSERT INTO `vehicles_persist` (id, location_x, location_y, location_z, rotation_x, rotation_y, rotation_z) VALUES (?, ?, ?, ?, ?, ?, ?)', [
          vehicle.id, coords[0], coords[1], coords[2], rotation[0], rotation[1], rotation[2]
        ]);

        vehicle.setStored('parked');

        saved++;
      } catch (err: any) { // eslint-disable-line
        DEBUG('Unable to save', vehicle.id, vehicle.plate, 'to DB', err);
      }
    }
    vehicle.despawn(true);
  };

  console.log(`Saved ${saved} vehicles to the DB`);
}

const useTxAdminEvent: boolean = GetConvarInt('persistvehicles:useTxAdminEvent', 1) === 1;
on(useTxAdminEvent ? 'txAdmin:events:serverShuttingDown' : 'onResourceStop', (resource: string) => {
  if (resource !== GetCurrentResourceName()) return;
  SaveAllVehicles();
});

setTimeout(async () => {
  DEBUG(`Respawning vehicles`);
  MySQL.query('SELECT * FROM `vehicles_persist`', async (vehicles: persistedVehicle[]) => {
    DEBUG('Respawning', vehicles.length, 'vehicles');
    vehicles.forEach(async (vehicleData) => {
      const { id, location_x, location_y, location_z, rotation_x, rotation_y, rotation_z } = vehicleData;
  
      SpawnVehicle(id, [location_x, location_y, location_z + 0.98], rotation_z)
      .then(vehicle => {
        if (!vehicle) return DEBUG(`Vehicle ${id} was not created!`);
        SetEntityRotation(vehicle.entity, rotation_x, rotation_y, rotation_z, 0, false);
      });  
    });

    MySQL.update('DELETE FROM `vehicles_persist`');
    DEBUG(`Respawned all vehicles`);
  });
}, 1000);

if (dev) RegisterCommand('saveallvehicles', (src: string) => {
  if (!IsPlayerAceAllowed(src,'group.admin')) return;
  SaveAllVehicles();
}, false);

if (doVersionCheck) {
  const repository = GetResourceMetadata(GetCurrentResourceName(), 'repository', 0);
  versionCheck(repository.match(/github\.com\/([^/]+\/[^.]+)/)[1]);
}