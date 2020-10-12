const sql = require("./db.js");

// constructor
const Misc = function(misc) {
  this.id = misc.id;
  this.name = misc.name;
};

Misc.getMusicGenres = result => {
  sql.query("SELECT genres.id, genres.name FROM genres ORDER BY genres.name ASC", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log("Music Genres: ", res);
    result(null, res);
  });
};

Misc.getRoles = result => {
  sql.query("SELECT roles.id, roles.name_ptbr AS name, roles.description_ptbr AS description, roles.instrumentalist FROM roles ORDER BY roles.id = 30 DESC, roles.id = 31 DESC, roles.id = 29 DESC, roles.id = 10 DESC, roles.id = 11 DESC, roles.id = 48 DESC, name ASC", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    console.log("Roles: ", res);
    result(null, res);
  });
};

Misc.getAvailabilityStatuses = result => {
  sql.query("SELECT availability_statuses.id, availability_statuses.title_ptbr AS title, availability_statuses.color FROM availability_statuses ORDER BY availability_statuses.id = 8 ASC", (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Misc.getAvailabilityItems = result => {
  sql.query("SELECT availability_items.id, availability_items.name_ptbr AS name FROM availability_items ORDER BY availability_items.id ASC", (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Misc.getAvailabilityFocuses = result => {
  sql.query("SELECT availability_focuses.id, availability_focuses.title_ptbr AS title FROM availability_focuses ORDER BY id ASC", (err, res) => {
    if (err) {
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Misc.getProductInfo = (productId, result) => {
  sql.query(`SELECT brands_products.id, brands_products.name, CONCAT('https://ik.imagekit.io/mublin/products/tr:h-600,w-600,cm-pad_resize,bg-FFFFFF/',brands_products.picture) AS picture, brands.id AS brandId, brands.name AS brandName, brands.logo AS brandLogo, brands_categories.id AS categoryId, brands_categories.name_ptbr AS categoryName FROM brands_products LEFT JOIN brands ON brands_products.id_brand = brands.id LEFT JOIN brands_categories ON brands_products.id_category = brands_categories.id WHERE brands_products.id = ${productId} LIMIT 1`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found product with the productId
    result({ kind: "not_found" }, null);
  });
};

Misc.getProductOwners = (productId, result) => {
  sql.query(`SELECT users.id, users.name, users.lastname, users.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.id,'/',users.picture) AS picture, countries.name AS country, regions.name AS region, cities.name AS city, users_gear.featured, users_gear.currently_using AS currentlyUsing, users_gear.for_sale AS forSale, users_gear.price AS price, users_gear.photo, users_gear.id_product AS productId, users_gear.created FROM users_gear LEFT JOIN users ON users_gear.id_user = users.id LEFT JOIN countries ON users.id_country_fk = countries.id LEFT JOIN regions ON users.id_region_fk = regions.id LEFT JOIN cities ON users.id_city_fk = cities.id WHERE users_gear.id_product = ${productId} ORDER BY users_gear.created DESC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found product owners with the productId
    result({ kind: "not_found" }, null);
  });
};

Misc.getBrands = (result) => {
  sql.query(`SELECT brands.id, brands.name, CONCAT('https://ik.imagekit.io/mublin/products/brands/tr:h-600,w-600,cm-pad_resize,bg-FFFFFF/',brands.logo) AS logo FROM brands WHERE brands.active = 1 ORDER BY brands.name ASC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found any brands
    result({ kind: "not_found" }, null);
  });
};

Misc.getBrandProducts = (brandId, result) => {
  sql.query(`SELECT brands_products.id, brands_products.name, CONCAT('https://ik.imagekit.io/mublin/products/tr:h-600,w-600,cm-pad_resize,bg-FFFFFF/',brands_products.picture) AS picture, brands.id AS brandId, brands.name AS brandName, brands.logo AS brandLogo, brands_categories.id AS categoryId, brands_categories.name_ptbr AS categoryName FROM brands_products LEFT JOIN brands ON brands_products.id_brand = brands.id LEFT JOIN brands_categories ON brands_products.id_category = brands_categories.id WHERE brands_products.id_brand = ${brandId} AND brands.active = 1 GROUP BY brands_products.id ORDER BY brands_products.name ASC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found any products for this brand
    result({ kind: "not_found" }, null);
  });
};

module.exports = Misc;