'use strict';

const { createIssue, getIssues, updateIssue, deleteIssue, isValidObjectId } = require('../models/issue');

module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res) {
      let project = req.params.project;
      const filters = req.query;
      
      try {
        const issues = getIssues(project, filters);
        res.json(issues);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })
    
    .post(function (req, res) {
      let project = req.params.project;
      const { issue_title, issue_text, created_by, assigned_to, status, priority } = req.body;
      
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
          status: status || 'open',
          priority: priority || ''
        });
        
        res.json(newIssue);
      } catch (err) {
        res.status(500).json({ error: err.message });
      }
    })
    
    .put(function (req, res) {
      let project = req.params.project;
      const { _id, issue_title, issue_text, created_by, assigned_to, status, priority, open } = req.body;
      
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
      if (status !== undefined) {
        updateFields.status = status;
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
