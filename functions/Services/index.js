const { PexelsDBPopulation } = require("./pexelsAPI");
const { DeviantArtPopulation } = require("./deviantArtAPI");
const { ChicagoArtInstitutePopulation } = require("./chicagoArtInstituteAPI");
const { CategoryBucketHandler } = require("./openRouterAPI");

exports.PexelsDBPopulation = PexelsDBPopulation;
exports.DeviantArtPopulation = DeviantArtPopulation;
exports.ChicagoArtInstitutePopulation = ChicagoArtInstitutePopulation;
exports.CategoryBucketHandler = CategoryBucketHandler;