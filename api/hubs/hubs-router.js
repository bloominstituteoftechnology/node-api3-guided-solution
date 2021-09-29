const express = require('express');
const yup = require('yup'); // stretch, if there is time

const Hubs = require('./hubs-model.js');
const Messages = require('../messages/messages-model.js');

const router = express.Router();

router.use((req, res, next) => {
  console.log('Hubs Router!');
  next();
});

// this only runs if the url has /api/hubs in it
router.get('/', (req, res) => {
  Hubs.find(req.query)
    .then(hubs => {
      res.status(200).json(hubs);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error retrieving the hubs',
      });
    });
});

// /api/hubs/:id
router.get('/:id', validateId, (req, res) => {
  res.status(200).json(req.hub);
});

router.post('/', requiredBody, validateHub, (req, res) => {
  Hubs.add(req.body)
    .then(hub => {
      res.status(201).json(hub);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error adding the hub',
      });
    });
});

router.delete('/:id', validateId, (req, res) => {
  Hubs.remove(req.params.id)
    .then(count => {
      if (count > 0) {
        res.status(200).json({ message: 'The hub has been nuked' });
      } else {
        res.status(404).json({ message: 'The hub could not be found' });
      }
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error removing the hub',
      });
    });
});

router.put('/:id', [validateId, requiredBody], (req, res) => {
  Hubs.update(req.params.id, req.body)
    .then(hub => {
      if (hub) {
        res.status(200).json(hub);
      } else {
        res.status(404).json({ message: 'The hub could not be found' });
      }
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error updating the hub',
      });
    });
});

// add an endpoint that returns all the messages for a hub
// this is a sub-route or sub-resource
router.get('/:id/messages', validateId, (req, res) => {
  Hubs.findHubMessages(req.params.id)
    .then(messages => {
      res.status(200).json(messages);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error getting the messages for the hub',
      });
    });
});

// add an endpoint for adding new message to a hub
router.post('/:id/messages', [validateId, requiredBody], (req, res) => {
  const messageInfo = { ...req.body, hub_id: req.params.id };

  Messages.add(messageInfo)
    .then(message => {
      res.status(210).json(message);
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error getting the messages for the hub',
      });
    });
});

function validateId(req, res, next) {
  const { id } = req.params;
  Hubs.findById(id)
    .then(hub => {
      if (hub) {
        req.hub = hub;
        next();
      } else {
        res.status(404).json({ message: "Invalid id; hub not found" });

        // error handling middleware option:
        // next({ message: "Invalid id; hub not found"});
      }
    })
    .catch(error => {
      // log error to server
      console.log(error);
      res.status(500).json({
        message: 'Error processing request',
      });
    });
}

function requiredBody(req, res, next) {
  if (req.body && Object.keys(req.body).length > 0) {
    next();
  } else {
    res.status(400).json({ message: "Please include request body" });

    // error handling middleware option:
    // next({ message: "Please include request body" }));
  }
}

const hubSchema = yup.object().shape({ // stretch, if there is time
  name: yup
    .string()
    .typeError('it needs to be a string!')
    .trim('only whitespace does not count')
    .required('the name is required')
    .min(3, 'name has to be 3 chars long')
    .max(10, 'name should be 10 chars tops')
})

async function validateHub (req, res, next) { // stretch, if there is time
  try {
    const validated = await hubSchema.validate(
      req.body,
      { strict: true, stripUnknown: true },
    )
    req.body = validated
    next()
  } catch (err) {
    res.json(err.message)
  }
}

module.exports = router;
