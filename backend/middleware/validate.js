const Joi = require('joi');

const schemas = {
  register: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).max(128).required(),
  }),
  login: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
  product: Joi.object({
    name: Joi.string().min(2).max(100).required(),
    tagline: Joi.string().min(10).max(120).required(),
    description: Joi.string().min(50).max(5000).required(),
    category: Joi.string().required(),
    websiteUrl: Joi.string().uri().required(),
    githubUrl: Joi.string().uri().allow('').optional(),
    tags: Joi.array().items(Joi.string()).max(5).optional(),
  }),
  comment: Joi.object({
    content: Joi.string().min(1).max(2000).required(),
    parentId: Joi.string().optional(),
  }),
};

function validate(schemaName) {
  return (req, res, next) => {
    const { error } = schemas[schemaName].validate(req.body, { abortEarly: false });
    if (error) {
      return res.status(400).json({
        error: 'Validation failed',
        details: error.details.map(d => d.message),
      });
    }
    next();
  };
}

module.exports = { validate };
