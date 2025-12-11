const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  
  // Test 1: Create an issue with every field
  test('Create an issue with every field', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Test Issue',
        issue_text: 'Test description',
        created_by: 'User',
        assigned_to: 'Admin',
        status: 'in progress',
        priority: 'high'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Test Issue');
        assert.equal(res.body.issue_text, 'Test description');
        assert.equal(res.body.created_by, 'User');
        assert.equal(res.body.assigned_to, 'Admin');
        assert.equal(res.body.status, 'in progress');
        assert.equal(res.body.priority, 'high');
        assert.equal(res.body.open, true);
        assert.property(res.body, '_id');
        assert.property(res.body, 'created_on');
        assert.property(res.body, 'updated_on');
        done();
      });
  });

  // Test 2: Create an issue with only required fields
  test('Create an issue with only required fields', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Required Only',
        issue_text: 'Text only',
        created_by: 'User'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.issue_title, 'Required Only');
        assert.equal(res.body.issue_text, 'Text only');
        assert.equal(res.body.created_by, 'User');
        assert.equal(res.body.assigned_to, '');
        assert.equal(res.body.status, 'open');
        assert.equal(res.body.priority, '');
        assert.property(res.body, '_id');
        done();
      });
  });

  // Test 3: Create an issue with missing required fields
  test('Create an issue with missing required field(s)', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Missing text'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'required field(s) missing');
        done();
      });
  });

  // Test 4: View issues on a project
  test('View issues on a project', function(done) {
    chai.request(server)
      .get('/api/issues/test')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        done();
      });
  });

  // Test 5: View issues on a project with one filter
  test('View issues on a project with one filter', function(done) {
    chai.request(server)
      .get('/api/issues/test?open=true')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.equal(issue.open, true);
        });
        done();
      });
  });

  // Test 6: View issues on a project with multiple filters
  test('View issues on a project with multiple filters', function(done) {
    chai.request(server)
      .get('/api/issues/test?open=true&priority=high')
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.isArray(res.body);
        res.body.forEach(issue => {
          assert.equal(issue.open, true);
          assert.equal(issue.priority, 'high');
        });
        done();
      });
  });

  // Test 7: Update one field on an issue
  test('Update one field on an issue', function(done) {
    // First create an issue to get its ID
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'To Update',
        issue_text: 'Text',
        created_by: 'User'
      })
      .end(function(err, res) {
        const issueId = res.body._id;
        
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: issueId,
            status: 'resolved'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.success, 'successfully updated');
            assert.equal(res.body._id, issueId);
            done();
          });
      });
  });

  // Test 8: Update multiple fields on an issue
  test('Update multiple fields on an issue', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'Multiple Update',
        issue_text: 'Text',
        created_by: 'User'
      })
      .end(function(err, res) {
        const issueId = res.body._id;
        
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: issueId,
            status: 'in progress',
            priority: 'critical'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.success, 'successfully updated');
            assert.equal(res.body._id, issueId);
            done();
          });
      });
  });

  // Test 9: Update an issue with missing _id
  test('Update an issue with missing _id', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        status: 'resolved'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

  // Test 10: Update an issue with no fields to update
  test('Update an issue with no fields to update', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'No Update Fields',
        issue_text: 'Text',
        created_by: 'User'
      })
      .end(function(err, res) {
        const issueId = res.body._id;
        
        chai.request(server)
          .put('/api/issues/test')
          .send({
            _id: issueId
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.error, 'no update field(s) sent');
            assert.equal(res.body._id, issueId);
            done();
          });
      });
  });

  // Test 11: Update an issue with an invalid _id
  test('Update an issue with an invalid _id', function(done) {
    chai.request(server)
      .put('/api/issues/test')
      .send({
        _id: 'invalidid',
        status: 'resolved'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not update');
        assert.equal(res.body._id, 'invalidid');
        done();
      });
  });

  // Test 12: Delete an issue
  test('Delete an issue', function(done) {
    chai.request(server)
      .post('/api/issues/test')
      .send({
        issue_title: 'To Delete',
        issue_text: 'Text',
        created_by: 'User'
      })
      .end(function(err, res) {
        const issueId = res.body._id;
        
        chai.request(server)
          .delete('/api/issues/test')
          .send({
            _id: issueId
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.success, 'successfully deleted');
            assert.equal(res.body._id, issueId);
            done();
          });
      });
  });

  // Test 13: Delete an issue with an invalid _id
  test('Delete an issue with an invalid _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({
        _id: 'invalidid'
      })
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'could not delete');
        assert.equal(res.body._id, 'invalidid');
        done();
      });
  });

  // Test 14: Delete an issue with missing _id
  test('Delete an issue with missing _id', function(done) {
    chai.request(server)
      .delete('/api/issues/test')
      .send({})
      .end(function(err, res) {
        assert.equal(res.status, 200);
        assert.equal(res.body.error, 'missing _id');
        done();
      });
  });

});
