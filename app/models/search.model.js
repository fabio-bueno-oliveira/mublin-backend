const sql = require("./db.js");
// const { sign } = require("jsonwebtoken");
const jwt = require("jsonwebtoken");

// constructor
const Search = function(search) {
  //this.created = user.created;
};

Search.saveSearch = (loggedID, query, source, result) => {
  let x = jwt.verify(loggedID.slice(7), process.env.JWT_SECRET)
  sql.query(`INSERT INTO search_history (id_user, query, source) VALUES (${x.result.id}, '${query}', '${source}')`, (err, res) => {
    if (err) {
      console.log("error saving log: ", err);
      result(err, null);
      return;
    }

    // console.log("Query saved: ", { id: res.insertId, userId: x.result.id, query: query });
    // result(null, { id: res.insertId, userId: x.result.id, query: query });
    result(null, { success: true });
  });
};

Search.findUsersByKeyword = (keyword, userCity, result) => {
  sql.query(`SELECT u.id, u.name, u.lastname, u.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',u.picture) AS picture, u.public AS publicProfile, IF(u.payment_plan=1,'Free', 'Pro') AS plan, u.status, u.legend_badge AS legend, u.verified, u.open_to_work AS openToWork, u.open_to_work_text AS openToWorkText, cities.name AS city, regions.name AS region, countries.name AS country, r.name_ptbr AS roleName, r.description_ptbr AS mainRole, r.instrumentalist, projects.name AS projectRelated, projects.public AS projectPublic, avs.title_ptbr AS availabilityStatus, avs.color AS availability_color, pty.name_ptbr AS projectType, (SELECT COUNT(projects.id) FROM users_projects JOIN projects ON users_projects.id_project_fk = projects.id WHERE users_projects.id_user_fk = u.id AND users_projects.show_on_profile = 1 AND (users_projects.left_in IS NULL OR users_projects.left_in = '') AND (projects.end_year IS NULL OR projects.end_year = '')) AS totalProjects FROM users AS u LEFT JOIN users_roles ON u.id = users_roles.id_user_fk LEFT OUTER JOIN roles AS r ON users_roles.id_role_fk = r.id LEFT OUTER JOIN users_projects ON u.id = users_projects.id_user_fk LEFT OUTER JOIN projects ON users_projects.id_project_fk = projects.id LEFT OUTER JOIN projects_types AS pty ON projects.type = pty.id LEFT JOIN availability_statuses AS avs ON u.availability_status = avs.id LEFT JOIN cities ON u.id_city_fk = cities.id LEFT JOIN regions ON u.id_region_fk = regions.id LEFT JOIN countries ON u.id_country_fk = countries.id LEFT JOIN users_genres AS ug ON u.id = ug.id_user_fk LEFT JOIN genres ON ug.id_genre_fk = genres.id WHERE MATCH(u.name, u.lastname) AGAINST ('%${keyword}%') OR u.name LIKE '%${keyword}%' OR u.lastname LIKE '%${keyword}%' OR u.bio LIKE '%${keyword}%' OR cities.name LIKE '${keyword}' OR r.name_ptbr LIKE '${keyword}' OR r.description_ptbr LIKE '${keyword}' OR projects.name LIKE '${keyword}' OR projects.name LIKE '${keyword} %' OR projects.name LIKE '% ${keyword}' OR genres.name_ptbr LIKE '${keyword}' GROUP BY u.id HAVING u.public = 1 AND u.status = 1 ORDER BY u.name ASC, u.lastname ASC, (cities.name = '%${userCity}%') DESC LIMIT 50`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.findUsersProjectsFromUserSearch = (userId, result) => {
  sql.query(`SELECT up.id_project_fk AS projectId, p.name, p.username, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',p.id,'/',p.picture) AS picture, p.public FROM users_projects AS up LEFT JOIN projects AS p ON up.id_project_fk = p.id WHERE up.id_user_fk = ${userId} AND p.public = 1 ORDER BY up.featured DESC, up.joined_in DESC, up.portfolio DESC, p.name ASC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.findProjectsByKeyword = (loggedUserId, keyword, userCity, result) => {
  let x = jwt.verify(loggedUserId.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT p.id, p.name, p.username, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',p.picture) AS picture, p.public, cities.name AS city, regions.name AS region, countries.name AS country, genre1.name_ptbr AS mainGenre, genre2.name_ptbr AS secondGenre, genre3.name_ptbr AS thirdGenre, projects_types.name_ptbr AS type, p.label_show AS labelShow, p.label_text AS labelText, p.label_color AS labelColor, p.foundation_year AS foundationYear, p.end_year AS endYear, (SELECT users_projects.confirmed FROM users_projects WHERE users_projects.id_project_fk = p.id AND users_projects.id_user_fk = ${x.result.id}) AS participationStatus, (SELECT users_projects.id FROM users_projects WHERE users_projects.id_project_fk = p.id AND users_projects.id_user_fk = ${x.result.id}) AS participationId, users.name AS relatedUserName, users.lastname AS relatedUserLastname, users.username AS relatedUserUsername, users.picture AS relatedUserPicture, users.id AS relatedUserId FROM projects AS p LEFT JOIN projects_types ON projects_types.id = p.type LEFT JOIN genres AS genre1 ON p.id_genre_1_fk = genre1.id LEFT JOIN genres AS genre2 ON p.id_genre_2_fk = genre2.id LEFT JOIN genres AS genre3 ON p.id_genre_3_fk = genre3.id LEFT JOIN cities ON p.id_city_fk = cities.id LEFT JOIN regions ON p.id_region_fk = regions.id LEFT JOIN countries ON p.id_country_fk = countries.id LEFT JOIN users_projects ON p.id = users_projects.id_project_fk LEFT JOIN users ON users_projects.id_user_fk = users.id WHERE p.name LIKE '%${keyword}%' OR p.username LIKE '%${keyword}%' OR cities.name LIKE '%${keyword}%' OR users.name LIKE '${keyword}' OR users.lastname LIKE '${keyword}' OR users.username LIKE '${keyword}' OR CONCAT(users.name, ' ', users.lastname) LIKE '${keyword}' OR genre1.name_ptbr LIKE '%${keyword}%' OR genre2.name_ptbr LIKE '%${keyword}%' OR genre3.name_ptbr LIKE '%${keyword}%' GROUP BY users_projects.id_project_fk HAVING p.public = 1 ORDER BY (users.name = '${keyword}'), (users.lastname = '${keyword}'), CASE WHEN p.name = '${keyword}' THEN 0 WHEN p.name LIKE '${keyword}%' THEN 1 WHEN p.name LIKE '%${keyword}%' THEN 2 WHEN p.name LIKE '%${keyword}' THEN 3 ELSE 4 END, (cities.name = '%${userCity}%') DESC, ISNULL(p.end_year), p.end_year DESC LIMIT 50`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.findGearByKeyword = (keyword, result) => {
  sql.query(`SELECT p.id AS productId, p.name AS productName, p.picture AS productPicture, p.rare, series.id AS seriesId, series.name AS seriesName, b.name AS brand, b.slug AS brandSlug, b.logo AS brandLogo, c.name_ptbr AS colorPTBR, c.name AS color, pc.name_ptbr, pc.macro_category, (SELECT COUNT(id) FROM users_gear WHERE id_product = p.id) AS totalOwners FROM products AS p LEFT JOIN brands AS b ON p.id_brand = b.id LEFT JOIN products_series AS series ON p.id_product_series = series.id LEFT JOIN colors AS c ON p.color = c.id LEFT JOIN products_categories AS pc ON p.id_category = pc.id LEFT JOIN products_colors ON p.id = products_colors.id_product LEFT JOIN colors AS otherColors ON products_colors.id_color = otherColors.id WHERE p.name LIKE '%${keyword}%' OR b.name LIKE '%${keyword}%' OR p.short_subtitle LIKE '%${keyword}%' OR p.keywords LIKE '%${keyword}%' OR series.name LIKE '%${keyword}%' OR c.name LIKE '%${keyword}%' OR c.name_ptbr LIKE '%${keyword}%' OR pc.name_ptbr LIKE '%${keyword}%' OR otherColors.name LIKE '%${keyword}%' OR otherColors.name_ptbr LIKE '%${keyword}%' OR CONCAT(b.name,' ',p.name) LIKE '%${keyword}%' OR (MATCH (p.name) AGAINST ('%${keyword}%') AND MATCH (b.name) AGAINST ('%${keyword}%')) OR (MATCH (p.name) AGAINST ('%${keyword}%') AND MATCH (c.name) AGAINST ('%${keyword}%')) OR (MATCH (p.name) AGAINST ('%${keyword}%') AND MATCH (c.name_ptbr) AGAINST ('%${keyword}%')) OR (MATCH (b.name) AGAINST ('%${keyword}%') AND MATCH (c.name) AGAINST ('%${keyword}%')) OR (MATCH (b.name) AGAINST ('%${keyword}%') AND MATCH (c.name_ptbr) AGAINST ('%${keyword}%')) OR (MATCH (b.name) AGAINST ('%${keyword}%') AND MATCH (pc.name_ptbr) AGAINST ('%${keyword}%')) OR (MATCH (c.name_ptbr) AGAINST ('%${keyword}%') AND MATCH (pc.name_ptbr) AGAINST ('%${keyword}%')) GROUP BY p.id ORDER BY p.name ASC, b.name ASC LIMIT 50`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.findBrandsByKeyword = (keyword, result) => {
  sql.query(`SELECT brands.id, brands.name, brands.slug, brands.logo, brands.cover, brands.website FROM brands WHERE brands.name LIKE '%${keyword}%' OR brands.slug LIKE '%${keyword}%' OR brands.name LIKE '%${keyword}' OR brands.name LIKE '${keyword}%' OR MATCH (brands.name) AGAINST ('%${keyword}%') ORDER BY brands.name ASC LIMIT 50`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.getUserLastSearches = (loggedUserId, result) => {
  let x = jwt.verify(loggedUserId.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT query FROM search_history WHERE id_user = ${x.result.id} GROUP BY query ORDER BY createdAt DESC LIMIT 5`, (err, res) => {
    if (err) {
      // console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      // result(null, res.map((i) => i.query));
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.findUsersBySuggestion = (loggedUserId, result) => {
  let x = jwt.verify(loggedUserId.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT users.id, users.name, users.lastname, users.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',users.picture) AS picture, users.bio, users.verified, roles.name_ptbr AS roleName, roles.description_ptbr AS mainRole, roles.instrumentalist, cities.name AS city, regions.name AS region, countries.name AS country, IF(users.payment_plan=1,'Free', 'Pro') AS plan, availability_statuses.id AS availabilityId, availability_statuses.title_ptbr AS availabilityTitle, availability_statuses.color AS availabilityColor, (SELECT COUNT(id) FROM users_projects WHERE id_user_fk = users.id AND show_on_profile = 1) AS totalProjects, (SELECT name FROM cities WHERE id IN (SELECT id_city_fk FROM users WHERE id = ${x.result.id})) AS myCity FROM users LEFT JOIN users_roles ON users.id = users_roles.id_user_fk LEFT JOIN availability_statuses ON users.availability_status = availability_statuses.id LEFT OUTER JOIN roles ON users_roles.id_role_fk = roles.id LEFT JOIN cities ON users.id_city_fk = cities.id LEFT JOIN regions ON users.id_region_fk = regions.id LEFT JOIN countries ON users.id_country_fk = countries.id WHERE users.id NOT IN (SELECT id_followed FROM users_followers WHERE id_follower = ${x.result.id}) AND users.id <> ${x.result.id} AND users.public = 1 GROUP BY users.id ORDER BY cities.name = myCity DESC, RAND() LIMIT 8`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.getRandomFeaturedUsers = (loggedUserId, result) => {
  let x = jwt.verify(loggedUserId.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT u.id, u.name, u.lastname, u.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',u.picture) AS picture, u.verified, u.legend_badge AS legend, u.open_to_work AS openToWork, u.open_to_work_text AS openToWorkText, c.name AS city, r.name AS region, r.uf, rl.description_ptbr AS role FROM users AS u LEFT JOIN cities AS c ON u.id_city_fk = c.id LEFT JOIN regions AS r ON u.id_region_fk = r.id LEFT JOIN users_roles AS ur ON u.id = ur.id_user_fk LEFT JOIN roles AS rl ON ur.id_role_fk = rl.id WHERE u.status = 1 AND u.public = 1 GROUP BY u.username ORDER BY ur.main_activity DESC, u.legend_badge DESC, u.verified DESC, RAND() LIMIT 3;`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.getRandomFeaturedProjects = (loggedUserId, result) => {
  let x = jwt.verify(loggedUserId.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT p.id, p.name, p.username, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-165,w-165,c-maintain_ratio/',p.picture) AS picture, p.currentlyOnTour, g1.name_ptbr AS genre1, g2.name_ptbr AS genre2, c.name AS city, r.name AS region, r.uf, pt.name_ptbr AS type FROM projects AS p LEFT JOIN cities AS c ON p.id_city_fk = c.id LEFT JOIN regions AS r ON p.id_region_fk = r.id LEFT JOIN genres AS g1 ON p.id_genre_1_fk = g1.id LEFT JOIN genres AS g2 ON p.id_genre_2_fk = g2.id LEFT JOIN users_projects AS up ON p.id = up.id_project_fk LEFT JOIN projects_types AS pt ON p.type = pt.id WHERE p.public = 1 AND p.end_year IS NULL AND up.id_user_fk <> ${x.result.id} GROUP BY p.id ORDER BY RAND() LIMIT 12;`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.getNewRecentUsers = (loggedUserId, result) => {
  let x = jwt.verify(loggedUserId.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT u.id, u.name, u.lastname, u.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',u.picture) AS picture, u.verified, u.legend_badge AS legend, c.name AS city, r.name AS region, r.uf, rl.description_ptbr AS role FROM users AS u LEFT JOIN cities AS c ON u.id_city_fk = c.id LEFT JOIN regions AS r ON u.id_region_fk = r.id LEFT JOIN users_roles AS ur ON u.id = ur.id_user_fk LEFT JOIN roles AS rl ON ur.id_role_fk = rl.id WHERE u.status = 1 AND u.public = 1 GROUP BY u.username ORDER BY u.created DESC LIMIT 3;`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, res);
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.getHomeFeaturedUsers = result => {
  sql.query(`SELECT u.id, u.name, u.lastname, u.username, CONCAT('https://ik.imagekit.io/mublin/users/avatars/tr:h-200,w-200,c-maintain_ratio/',u.picture) AS picture, u.verified, u.legend_badge AS legend, c.name AS city, r.name AS region, r.uf, rl.description_ptbr AS role, genres.name_ptbr AS genre FROM users AS u LEFT JOIN cities AS c ON u.id_city_fk = c.id LEFT JOIN regions AS r ON u.id_region_fk = r.id LEFT JOIN users_roles AS ur ON u.id = ur.id_user_fk LEFT JOIN roles AS rl ON ur.id_role_fk = rl.id LEFT JOIN users_genres ON u.id = users_genres.id_user_fk LEFT JOIN genres ON users_genres.id_genre_fk = genres.id WHERE u.status = 1 AND u.public = 1 AND users_genres.main_genre = 1 AND u.picture IS NOT NULL AND u.picture <> '' GROUP BY u.username ORDER BY u.social_notability DESC, u.legend_badge DESC, u.verified DESC, RAND() LIMIT 14;`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log("Home Featured Users: ", res);
    result(null, res);
  });
};

Search.getHomeFeaturedBrands = result => {
  sql.query(`SELECT brands.id, brands.name, brands.slug, brands.logo, brands.website FROM brands ORDER BY RAND() LIMIT 30;`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    // console.log("Home Featured Users: ", res);
    result(null, res);
  });
};

Search.getFeaturedProducts = result => {
  sql.query(`SELECT p.id, p.name, p.short_subtitle, p.picture, p.rare, p.featured, b.name AS brandName, b.slug AS brandSlug, b.logo as brandLogo FROM products AS p LEFT JOIN brands AS b ON p.id_brand = b.id ORDER BY RAND(), p.featured DESC LIMIT 12;`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, { total: res.length, success: true, result: res });
  });
};

Search.getFeaturedGenres = result => {
  sql.query(`SELECT genres.id, genres.name_ptbr AS name FROM genres WHERE genres.id IN (SELECT projects.id_genre_1_fk FROM projects WHERE projects.public = 1 GROUP BY projects.id_genre_1_fk) OR genres.id IN (SELECT projects.id_genre_2_fk FROM projects WHERE projects.public = 1 GROUP BY projects.id_genre_2_fk) OR genres.id IN (SELECT projects.id_genre_3_fk FROM projects WHERE projects.public = 1 GROUP BY projects.id_genre_3_fk);`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, res);
  });
};

Search.findProjectsByGenre = (loggedUserId, genreId, userCity, result) => {
  let x = jwt.verify(loggedUserId.slice(7), process.env.JWT_SECRET)
  sql.query(`SELECT p.id, p.name, p.username, CONCAT('https://ik.imagekit.io/mublin/projects/tr:h-200,w-200,c-maintain_ratio/',p.picture) AS picture, p.public, cities.name AS city, regions.name AS region, regions.uf AS regionUF, countries.name AS country, genre1.name_ptbr AS mainGenre, genre2.name_ptbr AS secondGenre, genre3.name_ptbr AS thirdGenre, projects_types.name_ptbr AS type, p.label_show AS labelShow, p.label_text AS labelText, p.label_color AS labelColor, p.foundation_year AS foundationYear, p.end_year AS endYear, opportunities.id AS opportunityId, roles.description_ptbr AS opportunityRole FROM projects AS p LEFT JOIN projects_types ON projects_types.id = p.type LEFT JOIN genres AS genre1 ON p.id_genre_1_fk = genre1.id LEFT JOIN genres AS genre2 ON p.id_genre_2_fk = genre2.id LEFT JOIN genres AS genre3 ON p.id_genre_3_fk = genre3.id LEFT JOIN cities ON p.id_city_fk = cities.id LEFT JOIN regions ON p.id_region_fk = regions.id LEFT JOIN countries ON p.id_country_fk = countries.id LEFT JOIN projects_opportunities AS opportunities ON p.id = opportunities.id_project LEFT JOIN roles ON opportunities.id_role = roles.id WHERE p.id_genre_1_fk LIKE ${genreId} OR p.id_genre_2_fk LIKE ${genreId} OR p.id_genre_3_fk LIKE ${genreId} GROUP BY p.id HAVING p.public = 1 ORDER BY (cities.name = '%${userCity}%') DESC, ISNULL(p.end_year), p.end_year DESC LIMIT 50`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(err, null);
      return;
    }
    if (res.length) {
      result(null, { total: res.length, success: true, result: res });
      return;
    }
    result({ kind: "not_found" }, null);
  });
};

Search.getOpportunities = result => {
  sql.query(`SELECT opportunities.id, opportunities.info, opportunities.one_time_job AS oneTimeJob, opportunities.is_in_one_specific_location AS isInOneSpecificLocation, opportunities.venue_name AS venue, opportunities.rehearsal_in_person AS rehearsalInPerson, opportunities.fee_per_rehearsal AS feePerRehearsal, opportunities.fee_per_concert AS feePerConcert, projects.id AS projectId, projects.name AS projectName, projects.username AS projectSlug, projects.picture AS projectPicture, projects.cover_image AS projectCover, projectCity.name AS projectCity, projectRegion.name AS projectRegion, projectCountry.name AS projectCountry, roles.id AS roleId, roles.description_ptbr AS roleName, roles.icon AS roleIcon, experience.id AS experienceId, experience.title_en AS experienceEN, experience.title_ptbr AS experiencePTBR, relationship.id AS relationshipId, relationship.title_en AS relationshipEN, relationship.title_ptbr AS relationshipPTBR, author.id AS authorId, author.name AS authorName, author.lastname AS authorLastname, author.username AS authorUsername, author.picture AS authorPicture, cities.name AS opportunityCityName, cities.id AS opportunityCityId, regions.name AS opportunityRegionName, regions.id AS opportunityRegionId, countries.name AS opportunityCityCountry, countries.id AS opportunityCountryId, type.name_ptbr AS projectType FROM projects_opportunities AS opportunities LEFT JOIN projects ON opportunities.id_project = projects.id LEFT JOIN roles ON opportunities.id_role = roles.id LEFT JOIN projects_opportunities_exp AS experience ON opportunities.experience = experience.id LEFT JOIN projects_opportunities_rel AS relationship ON opportunities.id_relationship = relationship.id LEFT JOIN users AS author ON opportunities.id_user_created = author.id LEFT JOIN cities ON opportunities.id_city = cities.id LEFT JOIN regions ON opportunities.id_region = regions.id LEFT JOIN countries ON opportunities.id_country = countries.id LEFT JOIN cities AS projectCity ON projects.id_city_fk = projectCity.id LEFT JOIN regions AS projectRegion ON projects.id_region_fk = projectRegion.id LEFT JOIN countries AS projectCountry ON projects.id_country_fk = projectCountry.id LEFT JOIN projects_types AS type ON projects.type = type.id WHERE opportunities.visible = 1 ORDER BY opportunities.created DESC`, (err, res) => {
    if (err) {
      console.log("error: ", err);
      result(null, err);
      return;
    }
    result(null, { total: res.length, success: true, result: res });
  });
};

Search.getJobInfo = (jobId, result) => {
  sql.query(`SELECT opportunities.id, DATE_FORMAT(opportunities.created,'%d/%m/%Y às %H:%i:%s') AS created, UNIX_TIMESTAMP(opportunities.created) AS createdUNIX, opportunities.info, opportunities.one_time_job AS oneTimeJob, opportunities.is_in_one_specific_location AS isInOneSpecificLocation, opportunities.venue_name AS venue, opportunities.rehearsal_in_person AS rehearsalInPerson, opportunities.fee_per_rehearsal AS feePerRehearsal, opportunities.fee_per_concert AS feePerConcert, projects.id AS projectId, projects.name AS projectName, projects.username AS projectSlug, projects.picture AS projectPicture, projects.cover_image AS projectCover, projectCity.name AS projectCity, projectRegion.name AS projectRegion, projectCountry.name AS projectCountry, roles.id AS roleId, roles.description_ptbr AS roleName, roles.icon AS roleIcon, experience.id AS experienceId, experience.title_en AS experienceEN, experience.title_ptbr AS experiencePTBR, relationship.id AS relationshipId, relationship.title_en AS relationshipEN, relationship.title_ptbr AS relationshipPTBR, author.id AS authorId, author.name AS authorName, author.lastname AS authorLastname, author.username AS authorUsername, author.picture AS authorPicture, cities.name AS opportunityCityName, cities.id AS opportunityCityId, regions.name AS opportunityRegionName, regions.id AS opportunityRegionId, countries.name AS opportunityCityCountry, countries.id AS opportunityCountryId, type.name_ptbr AS projectType FROM projects_opportunities AS opportunities LEFT JOIN projects ON opportunities.id_project = projects.id LEFT JOIN roles ON opportunities.id_role = roles.id LEFT JOIN projects_opportunities_exp AS experience ON opportunities.experience = experience.id LEFT JOIN projects_opportunities_rel AS relationship ON opportunities.id_relationship = relationship.id LEFT JOIN users AS author ON opportunities.id_user_created = author.id LEFT JOIN cities ON opportunities.id_city = cities.id LEFT JOIN regions ON opportunities.id_region = regions.id LEFT JOIN countries ON opportunities.id_country = countries.id LEFT JOIN cities AS projectCity ON projects.id_city_fk = projectCity.id LEFT JOIN regions AS projectRegion ON projects.id_region_fk = projectRegion.id LEFT JOIN countries AS projectCountry ON projects.id_country_fk = projectCountry.id LEFT JOIN projects_types AS type ON projects.type = type.id WHERE opportunities.id = ${jobId} LIMIT 1`, (err, res) => {
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

module.exports = Search;