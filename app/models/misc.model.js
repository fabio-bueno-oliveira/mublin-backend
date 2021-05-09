const sql = require("./db.js");

// constructor
const Misc = function(misc) {
  this.name = misc.name;
  this.id_brand = misc.id_brand;
  this.id_category = misc.id_category;
  this.year = misc.year;
  this.color = misc.color;
  this.picture = misc.picture;
  this.id_user_creator = misc.id_user_creator;
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
  sql.query("SELECT roles.id, roles.name_ptbr AS name, roles.description_ptbr AS description, roles.instrumentalist, roles.icon FROM roles ORDER BY roles.id = 30 DESC, roles.id = 31 DESC, roles.id = 29 DESC, roles.id = 10 DESC, roles.id = 11 DESC, roles.id = 48 DESC, name ASC", (err, res) => {
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
  sql.query(`SELECT brands_products.id, brands_products.name, CONCAT('https://ik.imagekit.io/mublin/products/tr:h-600,w-600,cm-pad_resize,bg-FFFFFF/',brands_products.picture) AS picture, CONCAT('https://ik.imagekit.io/mublin/products/tr:w-600/',brands_products.picture) AS largePicture, brands.id AS brandId, brands.name AS brandName, brands.logo AS brandLogo, brands_categories.id AS categoryId, brands_categories.name_ptbr AS categoryName FROM brands_products LEFT JOIN brands ON brands_products.id_brand = brands.id LEFT JOIN brands_categories ON brands_products.id_category = brands_categories.id WHERE brands_products.id = ${productId} LIMIT 2`, (err, res) => {
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
  sql.query(`SELECT brands.id, brands.name, CONCAT('https://ik.imagekit.io/mublin/products/brands/tr:h-600,w-600,cm-pad_resize,bg-FFFFFF/',brands.logo) AS logo FROM brands_products LEFT JOIN brands ON brands_products.id_brand = brands.id GROUP BY brands.id ORDER BY brands.name ASC`, (err, res) => {
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

Misc.getAllBrands = (result) => {
  sql.query(`SELECT brands.id, brands.name, CONCAT('https://ik.imagekit.io/mublin/products/brands/tr:h-600,w-600,cm-pad_resize,bg-FFFFFF/',brands.logo) AS logo FROM brands ORDER BY brands.name ASC`, (err, res) => {
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

Misc.getBrandCategories = (brandId, result) => {
  sql.query(`SELECT brands_categories.id, brands_categories.name_ptbr AS name FROM brands_products LEFT JOIN brands_categories ON brands_products.id_category = brands_categories.id WHERE brands_products.id_brand = ${brandId} GROUP BY brands_categories.id ORDER BY brands_categories.name_ptbr ASC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found any categories for this brand
    result({ kind: "not_found" }, null);
  });
};

Misc.getGearMacroCategories = (result) => {
  sql.query(`SELECT brands_categories.macro_category AS name FROM brands_categories GROUP BY brands_categories.macro_category ORDER BY brands_categories.macro_category ASC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found any macro categories
    result({ kind: "not_found" }, null);
  });
};

Misc.getGearCategories = (result) => {
  sql.query(`SELECT brands_categories.id, brands_categories.name_ptbr AS name, brands_categories.macro_category FROM brands_categories ORDER BY brands_categories.name_ptbr ASC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found any categories
    result({ kind: "not_found" }, null);
  });
};

Misc.getBrandProducts = (brandId, categoryId, result) => {
  sql.query(`SELECT brands_products.id, brands_products.name, CONCAT('https://ik.imagekit.io/mublin/products/tr:h-600,w-600,cm-pad_resize,bg-FFFFFF/',brands_products.picture) AS picture, brands.id AS brandId, brands.name AS brandName, brands.logo AS brandLogo, brands_categories.id AS categoryId, brands_categories.name_ptbr AS categoryName, brands_products_colors.name AS colorName, brands_products_colors.name_ptbr AS colorNamePTBR FROM brands_products LEFT JOIN brands ON brands_products.id_brand = brands.id LEFT JOIN brands_categories ON brands_products.id_category = brands_categories.id LEFT JOIN brands_products_colors ON brands_products.color = brands_products_colors.id WHERE brands_products.id_brand = ${brandId} AND brands_products.id_category = ${categoryId} AND brands.active = 1 GROUP BY brands_products.id ORDER BY brands_products.name ASC`, (err, res) => {
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

Misc.submitNewGearProduct = (newProduct, result) => {
  sql.query("INSERT INTO brands_products SET ?", newProduct, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("created product: ", { id: res.insertId, ...newProduct });
    result(null, { id: res.insertId, ...newProduct });
  });
};

Misc.submitNewGearBrand = (name, logo, id_user_creator, result) => {
  sql.query(`INSERT INTO brands (name, logo, id_user_creator) VALUES ('${name}', '${logo}', ${id_user_creator})`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    console.log("created brand: ", { id: res.insertId, name: name, logo: logo });
    result(null, { id: res.insertId, name: name, logo: logo, success: true });
  });
};

Misc.getProductColors = (result) => {
  sql.query(`SELECT brands_products_colors.id, brands_products_colors.name, brands_products_colors.name_ptbr FROM brands_products_colors ORDER BY brands_products_colors.name ASC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found any colors
    result({ kind: "not_found" }, null);
  });
};

Misc.getAllStrengths = (result) => {
  sql.query(`SELECT strengths.id, strengths.title_ptbr AS title, strengths.icon FROM strengths ORDER BY strengths.title_ptbr ASC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    // not found any strengths
    result({ kind: "not_found" }, null);
  });
};

module.exports = Misc;