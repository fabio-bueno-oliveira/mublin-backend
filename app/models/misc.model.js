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
  sql.query("SELECT g.id, g.name_ptbr AS name, c.id AS categoryId, c.name_ptbr AS categoryName, cs.id AS secondCategoryId, cs.name_ptbr AS secondCategoryName FROM genres AS g LEFT JOIN genres_categories AS c ON g.id_category = c.id LEFT JOIN genres_categories AS cs ON g.id_category_secondary = cs.id WHERE g.active = 1 ORDER BY c.id = 4 DESC, c.id = 5 ASC, c.name_ptbr ASC, g.main_genre DESC, g.name_ptbr ASC;", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log("Music Genres: ", res);
    result(null, res);
  });
};

Misc.getMusicGenresCategories = result => {
  sql.query("SELECT gc.id, gc.name_ptbr, gc.name FROM genres_categories AS gc ORDER BY gc.id = 4 DESC, gc.id = 5 ASC, gc.name_ptbr ASC;", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log("Music Genres Categories: ", res);
    result(null, res);
  });
};

Misc.getGenreNameById = (genreId, result) => {
  sql.query(`SELECT genres.id, genres.name, genres.name, genres.name_ptbr AS namePTBR FROM genres WHERE genres.id = ${genreId} LIMIT 2`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }

    result({ kind: "not_found" }, null);
  });
};

Misc.getRoles = result => {
  sql.query("SELECT r.id, r.name_ptbr AS name, r.description_ptbr AS description, r.instrumentalist, r.icon, r.applies_to_a_project AS appliesToProject FROM roles AS r ORDER BY r.id = 31 DESC, r.id = 29 DESC, r.id = 10 DESC, r.id = 11 DESC, r.id = 30 DESC, r.id = 48 DESC, name ASC", (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log("Roles: ", res);
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
  sql.query(`SELECT p.id, p.name, p.short_subtitle AS subtitle, CONCAT('https://ik.imagekit.io/mublin/products/tr:h-600,w-600,cm-pad_resize,bg-FFFFFF/',p.picture) AS picture, CONCAT('https://ik.imagekit.io/mublin/products/',p.picture) AS largePicture, p.description, p.description_source AS descriptionSource, p.description_source_url AS descriptionSourceUrl, series.id AS seriesId, series.name AS seriesName, b.id AS brandId, b.name AS brandName, b.slug AS brandSlug, b.logo AS brandLogo, cat.id AS categoryId, cat.name_ptbr AS categoryName, colors.id AS colorId, colors.name AS colorName, colors.name_ptbr AS colorNamePTBR, colors.rgb AS colorRgb, colors.img_sample AS colorSample, p.rare, p.discontinued FROM products AS p LEFT JOIN brands AS b ON p.id_brand = b.id LEFT JOIN products_categories AS cat ON p.id_category = cat.id LEFT JOIN colors ON p.color = colors.id LEFT JOIN products_series AS series ON p.id_product_series = series.id WHERE p.id = ${productId} LIMIT 2`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }
    // not found product with the productId
    result({ kind: "not_found" }, null);
  });
};

Misc.getProductAvailableColors = (productId, result) => {
  sql.query(`SELECT pc.id_product AS productId, pc.picture AS pictureFilename, CONCAT('https://ik.imagekit.io/mublin/products/tr:h-600,w-600,cm-pad_resize,bg-FFFFFF/',pc.picture) AS picture, CONCAT('https://ik.imagekit.io/mublin/products/',pc.picture) AS largePicture, colors.id AS colorId, colors.name AS colorName, colors.name_ptbr AS colorNamePTBR, colors.rgb AS colorRgb, colors.img_sample AS colorSample, colors.type AS colorType, pc.main AS mainColor FROM products_colors AS pc LEFT JOIN colors ON pc.id_color = colors.id WHERE pc.id_product = ${productId} ORDER BY pc.main DESC, colors.name ASC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    // not found product with the productId
    result({ kind: "not_found" }, null);
  });
};

Misc.getProductOwners = (productId, result) => {
  sql.query(`SELECT users.id, users.name, users.lastname, users.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.picture) AS picture, countries.name AS country, regions.name AS region, regions.uf AS regionUF, cities.name AS city, ug.featured, ug.currently_using AS currentlyUsing, ug.for_sale AS forSale, ug.price AS price, ug.photo, ug.id_product AS productId, DATE_FORMAT(ug.created,'%d/%m/%Y %H:%i:%s') AS created, ug.owner_comments	AS ownerComments, it.name_ptbr AS tuning, it.description AS tuningDescription, users.verified, users.legend_badge AS legend FROM users_gear AS ug LEFT JOIN instrument_tunings AS it ON ug.tuning = it.id LEFT JOIN users ON ug.id_user = users.id LEFT JOIN countries ON users.id_country_fk = countries.id LEFT JOIN regions ON users.id_region_fk = regions.id LEFT JOIN cities ON users.id_city_fk = cities.id WHERE ug.id_product = ${productId} ORDER BY ug.created DESC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    // not found product owners with the productId
    result({ kind: "not_found" }, null);
  });
};

Misc.getTunings = (result) => {
  sql.query(`SELECT t.id, t.name AS nameEN, t.name_ptbr AS namePTBR, t.description, t.instrument_type AS instrumentType FROM instrument_tunings AS t ORDER BY t.id ASC`, (err, res) => {
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

Misc.getBrandInfo = (brandUrlName, result) => {
  sql.query(`SELECT b.id, b.name, b.slug, b.description, CONCAT('https://ik.imagekit.io/mublin/products/brands/tr:h-140,w-140,cm-pad_resize,bg-FFFFFF/',b.logo) AS logo, b.logo as logoFile, b.cover, b.id_related_brand AS relatedBrandId, b.website, rb.name AS relatedBrandName, rb.slug AS relatedBrandUrl, CONCAT('https://ik.imagekit.io/mublin/products/brands/tr:h-600,w-600,cm-pad_resize,bg-FFFFFF/',rb.logo) AS relatedBrandLogo, brands_categories.name_ptbr AS category FROM brands AS b LEFT JOIN brands AS rb ON b.id_related_brand = rb.id LEFT JOIN brands_categories ON b.id_category = brands_categories.id WHERE b.slug = '${brandUrlName}' LIMIT 1`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res[0]);
      return;
    }
    // not found product with the productId
    result({ kind: "not_found" }, null);
  });
};

Misc.getBrandPartners = (brandUrlName, result) => {
  sql.query(`SELECT users.id, users.name, users.lastname, users.username, users.picture, users.legend_badge AS legend, users.verified FROM users_partners LEFT JOIN users ON users_partners.id_user = users.id WHERE users_partners.id_brand = (SELECT brands.id FROM brands WHERE brands.slug = '${brandUrlName}' LIMIT 1) GROUP BY users.id ORDER BY users.legend_badge DESC, users.verified DESC, users.name ASC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    // not found any brand partners
    result({ kind: "not_found" }, null);
  });
};

Misc.getBrandOwners = (brandUrlName, result) => {
  sql.query(`SELECT users.id, users.name, users.lastname, users.username, users.picture, users.verified, users.legend_badge AS legend, users_gear.id_product AS productId, products.name AS productName FROM users_gear LEFT JOIN users ON users_gear.id_user = users.id LEFT JOIN products ON users_gear.id_product = products.id WHERE products.id_brand = (SELECT brands.id FROM brands WHERE brands.slug = '${brandUrlName}') AND users.status = 1 ORDER BY users.name ASC`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    // not found any brand partners
    result({ kind: "not_found" }, null);
  });
};

Misc.getBrandColors = (brandUrlName, result) => {
  sql.query(`SELECT products.id AS productId, colors.name, colors.rgb, colors.img_sample AS sample, products_colors.main AS mainColor FROM products LEFT JOIN products_colors ON products_colors.id_product = products.id LEFT JOIN colors ON products_colors.id_color = colors.id WHERE products_colors.id IS NOT NULL AND products.id_brand = (SELECT brands.id FROM brands WHERE brands.slug = '${brandUrlName}') ORDER BY colors.name`, (err, res) => {
    if (err) {
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    // not found any brand partners
    result({ kind: "not_found" }, null);
  });
};

Misc.getBrands = (result) => {
  sql.query(`SELECT brands.id, brands.slug, brands.name, CONCAT('https://ik.imagekit.io/mublin/products/brands/tr:h-600,w-600,cm-pad_resize,bg-FFFFFF/',brands.logo) AS logo FROM products LEFT JOIN brands ON products.id_brand = brands.id GROUP BY brands.id ORDER BY brands.name ASC`, (err, res) => {
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
  sql.query(`SELECT products_categories.id, products_categories.name_ptbr AS name FROM products LEFT JOIN products_categories ON products.id_category = products_categories.id WHERE products.id_brand = ${brandId} GROUP BY products_categories.id ORDER BY products_categories.name_ptbr ASC`, (err, res) => {
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
  sql.query(`SELECT products_categories.macro_category AS name FROM products_categories GROUP BY products_categories.macro_category ORDER BY products_categories.macro_category ASC`, (err, res) => {
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
  sql.query(`SELECT products_categories.id, products_categories.name_ptbr AS name, products_categories.macro_category FROM products_categories ORDER BY products_categories.name_ptbr ASC`, (err, res) => {
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

Misc.getBrandAllProducts = (brandUrlName, result) => {
  sql.query(`SELECT p.id, (SELECT COUNT(id) FROM users_gear WHERE id_product = p.id) AS totalOwners, p.name, p.short_subtitle AS subtitle, CONCAT('https://ik.imagekit.io/mublin/products/tr:h-600,w-600,cm-pad_resize,bg-FFFFFF/',p.picture) AS picture, p.rare, brands.id AS brandId, brands.name AS brandName, brands.logo AS brandLogo, products_categories.id AS categoryId, products_categories.name_ptbr AS categoryName, colors.name AS colorName, colors.name_ptbr AS colorNamePTBR, series.name AS series, series.id AS seriesId FROM products AS p LEFT JOIN brands ON p.id_brand = brands.id LEFT JOIN products_categories ON p.id_category = products_categories.id LEFT JOIN colors ON p.color = colors.id LEFT JOIN products_series AS series ON p.id_product_series = series.id WHERE brands.slug = '${brandUrlName}' GROUP BY p.id ORDER BY p.name ASC`, (err, res) => {
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

Misc.getBrandProducts = (brandId, categoryId, result) => {
  sql.query(`SELECT products.id, products.name, CONCAT('https://ik.imagekit.io/mublin/products/tr:h-600,w-600,cm-pad_resize,bg-FFFFFF/',products.picture) AS picture, products.can_be_subproduct, brands.id AS brandId, brands.name AS brandName, brands.logo AS brandLogo, products_categories.id AS categoryId, products_categories.name_ptbr AS categoryName, LOWER(products_categories.macro_category_en) AS macroCategory, colors.name AS colorName, colors.name_ptbr AS colorNamePTBR FROM products LEFT JOIN brands ON products.id_brand = brands.id LEFT JOIN products_categories ON products.id_category = products_categories.id LEFT JOIN colors ON products.color = colors.id WHERE products.id_brand = ${brandId} AND products.id_category = ${categoryId} AND brands.active = 1 GROUP BY products.id ORDER BY products.name ASC`, (err, res) => {
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
  sql.query("INSERT INTO products SET ?", newProduct, (err, res) => {
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
  sql.query(`SELECT colors.id, colors.name, colors.name_ptbr, colors.type FROM colors ORDER BY colors.type ASC, colors.name_ptbr ASC`, (err, res) => {
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