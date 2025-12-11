'use strict';

const { createIssue, getIssues, updateIssue, deleteIssue, isValidObjectId } = require('../models/issue');

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res) {
      let project = req.params.project;
      const filters = req.query;
      
      try {
        const issues = getIssues(project, filters);
        // Format each issue with consistent field order
        const formattedIssues = issues.map(issue => ({
          _id: issue._id,
          issue_title: issue.issue_title,
          issue_text: issue.issue_text,
          created_on: typeof issue.created_on === 'string' ? issue.created_on : issue.created_on.toISOString(),
          updated_on: typeof issue.updated_on === 'string' ? issue.updated_on : issue.updated_on.toISOString(),
          created_by: issue.created_by,
          assigned_to: issue.assigned_to,
          open: issue.open,
          status_text: issue.status_text,
          priority: issue.priority
        }));
        res.json(formattedIssues);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })
    
    .post(function (req, res) {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status_text, priority } = req.body;
      
      // Validate required fields
      if (!issue_title || !issue_text || !created_by) {
        return res.json({ error: 'required field(s) missing' });
      }
      
      try {
        const newIssue = createIssue(project, {
          issue_title,
          issue_text,
          created_by,
          assigned_to: assigned_to || '',
          status_text: status_text || 'open',
          priority: priority || ''
        });
        
        // Format response with specific field order - include all fields
        const response = {
          _id: newIssue._id,
          issue_title: newIssue.issue_title,
          issue_text: newIssue.issue_text,
          created_by: newIssue.created_by,
          assigned_to: newIssue.assigned_to,
          status_text: newIssue.status_text,
          priority: newIssue.priority,
          created_on: newIssue.created_on.toISOString(),
          updated_on: newIssue.updated_on.toISOString(),
          open: newIssue.open
        };
        
        res.json(response);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })
    
    .put(function (req, res) {
      let project = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status_text, priority, open } = req.body;
      
      // Validate _id is present
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      
      // Check if there are fields to update
      const updateFields = {};
      let hasUpdates = false;
      
      if (issue_title !== undefined) {
        updateFields.issue_title = issue_title;
        hasUpdates = true;
      }
      if (issue_text !== undefined) {
        updateFields.issue_text = issue_text;
        hasUpdates = true;
      }
      if (created_by !== undefined) {
        updateFields.created_by = created_by;
        hasUpdates = true;
      }
      if (assigned_to !== undefined) {
        updateFields.assigned_to = assigned_to;
        hasUpdates = true;
      }
      if (status_text !== undefined) {
        updateFields.status_text = status_text;
        hasUpdates = true;
      }
      if (priority !== undefined) {
        updateFields.priority = priority;
        hasUpdates = true;
      }
      if (open !== undefined) {
        updateFields.open = open;
        hasUpdates = true;
      }
      
      if (!hasUpdates) {
        return res.json({ error: 'no update field(s) sent', '_id': _id });
      }
      
      try {
        const updatedIssue = updateIssue(project, _id, updateFields);
        
        if (!updatedIssue) {
          return res.json({ error: 'could not update', '_id': _id });
        }
        
        res.json({ result: 'successfully updated', '_id': _id });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })
    
    .delete(function (req, res) {
      let project = req.params.project;
      const { _id } = req.body;
      
      // Validate _id is present
      if (!_id) {
        return res.json({ error: 'missing _id' });
      }
      
      try {
        const deleted = deleteIssue(project, _id);
        
        if (!deleted) {
          return res.json({ error: 'could not delete', '_id': _id });
        }
        
        res.json({ result: 'successfully deleted', '_id': _id });
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    });
    
};
