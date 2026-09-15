import { tabernacleModel } from './tabernacle.js';
import { campModel } from './camp.js';
import { solomonModel } from './solomon.js';
import { herodModel } from './herod.js';
export const MODELS=[tabernacleModel, campModel, solomonModel, herodModel];
export const modelById=id=>MODELS.find(m=>m.id===id);
