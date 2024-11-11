-- Dumping structure for table ox_core_1ab13f.vehicles_persist
CREATE TABLE IF NOT EXISTS `vehicles_persist` (
  `id` int(10) unsigned NOT NULL,
  `location_x` float NOT NULL DEFAULT 0,
  `location_y` float NOT NULL DEFAULT 0,
  `location_z` float NOT NULL DEFAULT 0,
  `rotation_x` float NOT NULL DEFAULT 0,
  `rotation_y` float NOT NULL DEFAULT 0,
  `rotation_z` float NOT NULL DEFAULT 0,
  KEY `vehicleId_FK1` (`id`),
  CONSTRAINT `vehicleId_FK1` FOREIGN KEY (`id`) REFERENCES `vehicles` (`id`) ON DELETE CASCADE ON UPDATE NO ACTION
);
