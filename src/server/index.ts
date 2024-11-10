import { GetVehicle, SpawnVehicle, OxVehicle } from "@overextended/ox_core/server";
import { oxmysql as MySQL } from '@overextended/oxmysql';
import { persistedVehicle } from "./types";

const dev = GetConvarInt('ox:debug', 0) === 1;
const DEBUG = (...args: any[]): void => {
  if (!dev) return;
  console.log(`[^4${GetCurrentResourceName()}^7]`, ...args);
};

const SaveAllVehicles = async () => {
  const vehicles: number[] = GetAllVehicles();

  let saved: number = 0;

  for (const entityId of vehicles) {
    const vehicle: OxVehicle = GetVehicle(entityId);

    if (!vehicle) continue;

    const coords: number[] = GetEntityCoords(entityId);
    const rotation: number[] = GetEntityRotation(entityId);

    try {
      MySQL.insert('INSERT INTO `vehicles_persist` (id, location_x, location_y, location_z, rotation_x, rotation_y, rotation_z) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [
        vehicle.id, coords[0], coords[1], coords[2], rotation[0], rotation[1], rotation[2]
      ], DEBUG);

      vehicle.setStored('parked');    
      vehicle.despawn(true);

      saved++;
    } catch (err: any) {
      DEBUG('Unable to save', vehicle.id, vehicle.plate, 'to DB', err.message);
    }
  };

  console.log(`Saved ${saved} vehicles to the DB`);
}

on('onResourceStop', (resource: string) => {
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