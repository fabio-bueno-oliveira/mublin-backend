module.exports = app => {
  const projects = require("../controllers/project.controller.js");
  const { checkToken } = require("../auth/token_validation");

  // Delete all Projects
  //app.delete("/projects", projects.deleteAll);

  // Create a new Project
  app.post("/project/create", checkToken, projects.create);

  // Update project picture with projectId
  app.put("/project/:projectId/picture", checkToken, projects.updatePicture);

  // Retrieve Users and Projects with keyword
  // app.get("/search/projects/:keyword", projects.findByKeyword);
  // app.get("/secure/search/projects/:keyword", checkToken, projects.findByKeyword);
  app.get("/semanticSearch/project/:keyword", checkToken, projects.findProjectByKeyword);

  // Retrieve Users and Projects with keyword
  //app.get("/search/projects/:keyword", projects.findByKeyword);

  // Retrieve all Projects
  app.get("/projects", projects.findAll);
  app.get("/secure/projects", checkToken, projects.findAll);

  // Retrieve a single Project with projectId
  app.get("/projects/:projectId", projects.findOne);
  app.get("/secure/projects/:projectId", checkToken, projects.findOne);

  // Retrieve a single Project with project username
  app.get("/project/:projectUsername", checkToken, projects.findProject);

  // Retrieve all projects with userId
  app.get("/user/:userId/projects", checkToken, projects.findAllUserProjects);
  // app.get("/secure/projects/user/:userId", checkToken, projects.findAllUserProjects);

  // Retrieve main projects with userId
   app.get("/projects/user/:userId/main", projects.findMainUserProjects);
   app.get("/secure/projects/user/:userId/main", checkToken, projects.findMainUserProjects);

  // Retrieve portfolio projects with userId
  app.get("/projects/user/:userId/portfolio", projects.findPortfolioUserProjects);
  app.get("/secure/projects/user/:userId/portfolio", checkToken, projects.findPortfolioUserProjects);

  // Update a Project with projectId
  app.put("/projects/:projectId", projects.update);
  app.put("/secure/projects/:projectId", checkToken, projects.update);

  // Retrieve all project members by project username
  app.get("/project/:projectUsername/members", checkToken, projects.members);

  // Retrieve all project members by project id
  app.get("/project/id/:projectId/members/", checkToken, projects.membersByProjectId);

  // Retrieve all official project members
  app.get("/projects/:projectUserName/members/official", projects.officialMembers);
  app.get("/secure/projects/:projectUserName/members/official", checkToken, projects.officialMembers);

  // Retrieve future project events by project username
  app.get("/project/:projectUsername/events", checkToken, projects.events);

  // Retrieve all project events by project username
  app.get("/project/:projectUsername/allEvents", checkToken, projects.allEvents);

  // Retrieve project career opportunities
  app.get("/project/:projectUsername/opportunities", checkToken, projects.opportunities);

  // Retrieve all project notes by project username
  app.get("/project/:projectUsername/notes", checkToken, projects.notes);
  
  // Check if project username is available
  app.get("/check/project/username/:projectUsername", projects.checkProjectUsername)

  // Update project bio
  app.put("/project/:projectUsername/updateBio", checkToken, projects.updateBio);

  // Update project tag
  app.put("/project/:projectUsername/updateTag", checkToken, projects.updateTag);

  // Update project category (main/portfolio)
  app.put("/project/:projectId/updateCategory", checkToken, projects.updateCategory);

  // Update user_project details
  app.put("/project/:userId/updateMemberDetails", checkToken, projects.updateMemberDetails);

  // Update user confirmation on a project (ex: request to join a project)
  app.put("/project/:projectId/updateMemberRequest", checkToken, projects.updateMemberRequest);

  // Decline user request to join a project
  app.put("/project/:projectId/declineMemberRequest", checkToken, projects.declineMemberRequest);

  // Remove user from project
  app.delete("/projects/:projectId/removeMember", projects.removeMember);

  // Delete a Project with projectId
  app.delete("/projects/:projectId/delete", projects.delete);
};
