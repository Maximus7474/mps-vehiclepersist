import { GetVehicle, SpawnVehicle, OxVehicle } from "@overextended/ox_core/server";
import { oxmysql as MySQL } from '@overextended/oxmysql';
import { persistedVehicle } from "./types";

on('onResourceStop', async (resource: string) => {
  if (resource !== GetCurrentResourceName()) return;

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
      ], console.log);

      vehicle.setStored('parked');    
      vehicle.despawn(true);

      saved++;
    } catch (err: any) {
      console.log('Unable to save', vehicle.id, vehicle.plate, 'to DB', err.message);
    }
  };

  console.log(`Saved ${saved} vehicles to the DB`);
});


setTimeout(async () => {
  console.log(`[${GetCurrentResourceName()}] Respawning vehicles !`);
  MySQL.query('SELECT * FROM `vehicles_persist`', async (vehicles: persistedVehicle[]) => {
    console.log('Respawning', vehicles.length, 'vehicles');
    vehicles.forEach(async (vehicleData) => {
      const { id, location_x, location_y, location_z, rotation_x, rotation_y, rotation_z } = vehicleData;
  
      SpawnVehicle(id, [location_x, location_y, location_z + 0.98], rotation_z)
      .then(vehicle => {
        if (!vehicle) return;
        SetEntityRotation(vehicle.entity, rotation_x, rotation_y, rotation_z, 0, false);
      });  
    });

    MySQL.update('DELETE FROM `vehicles_persist`');
    console.log(`[${GetCurrentResourceName()}] Respawned all vehicles`);
  });
}, 1000);