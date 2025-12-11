'use strict';

// Database in-memory para pruebas
let issues = {};

class Issue {
  constructor(project, title, text, createdBy, assignedTo = '', status_text = 'open', priority = '') {
    this._id = require('crypto').randomBytes(12).toString('hex');
    this.issue_title = title;
    this.issue_text = text;
    this.created_by = createdBy;
    this.assigned_to = assignedTo;
    this.status_text = status_text;
    this.open = true;
    this.priority = priority;
    this.created_on = new Date();
    this.updated_on = new Date();
  }
}

// Initialize project issues
function initProject(project) {
  if (!issues[project]) {
    issues[project] = [];
  }
}

// Create issue
function createIssue(project, issueData) {
  initProject(project);
  
  const newIssue = new Issue(
    project,
    issueData.issue_title,
    issueData.issue_text,
    issueData.created_by,
    issueData.assigned_to || '',
    issueData.status_text || 'open',
    issueData.priority || ''
  );
  
  issues[project].push(newIssue);
  return newIssue;
}

// Get issues
function getIssues(project, filters = {}) {
  initProject(project);
  
  let result = [...issues[project]];
  
  // Apply filters
  for (let filter in filters) {
    if (filters[filter] !== undefined && filters[filter] !== '') {
      result = result.filter(issue => {
        if (filter === 'open') {
          return issue.open === (filters[filter] === 'true');
        }
        return issue[filter] == filters[filter];
      });
    }
  }
  
  return result;
}

// Update issue
function updateIssue(project, issueId, updates) {
  initProject(project);
  
  const issue = issues[project].find(i => i._id === issueId);
  if (!issue) {
    return null;
  }
  
  for (let field in updates) {
    if (field === 'open') {
      issue[field] = updates[field] === 'false' ? false : true;
    } else if (field === 'status' && updates[field] !== undefined) {
      // Map 'status' to 'status_text'
      issue.status_text = updates[field];
    } else if (field === 'status_text' && updates[field] !== undefined) {
      issue.status_text = updates[field];
    } else if (issue.hasOwnProperty(field) || field === 'issue_title' || field === 'issue_text' || field === 'created_by' || field === 'assigned_to' || field === 'priority') {
      issue[field] = updates[field];
    }
  }
  
  issue.updated_on = new Date();
  return issue;
}

// Delete issue
function deleteIssue(project, issueId) {
  initProject(project);
  
  const index = issues[project].findIndex(i => i._id === issueId);
  if (index === -1) {
    return null;
  }
  
  issues[project].splice(index, 1);
  return { success: true };
}

// Validate ObjectId
function isValidObjectId(id) {
  return /^[a-f\d]{24}$/i.test(id);
}

module.exports = {
  Issue,
  createIssue,
  getIssues,
  updateIssue,
  deleteIssue,
  isValidObjectId,
  initProject
};
