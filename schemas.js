const BaseJoi = require('joi') //data validator for JavaScript. for validation on adding data in databas
const sanitizeHtml = require('sanitize-html');

//define custom joi validator to handle sanitize input that contains HTML tag
const extension = (joi) => ({
    type: 'string',
    base: joi.string(),
    messages: { 'string.escapeHTML': '{{#label}} must not include HTML!'},
    rules: {
        escapeHTML: {
            validate(value, helpers) {
                const clean = sanitizeHtml(value, {
                    allowedTags: [],
                    allowedAttributes: {}
                });
                if (clean !== value) return helpers.error('string.escapeHTML', {value})
                return clean;
            }
        }
    }
});

///extend joi to include the custom validaror escapeHTML()
const Joi = BaseJoi.extend(extension);

const campgroundSchema = Joi.object({
    campground: Joi.object({ //note in req.body everything comes in campground[..] format//refer to new.ejs
        title: Joi.string().required().escapeHTML(),
        // image: Joi.string().required(),
        price: Joi.number().required().min(0),
        description: Joi.string().required().escapeHTML(),
        location: Joi.string().required().escapeHTML()
    }).required(),
    deleteImages:Joi.array()//for deleting images, 
    //note in edit.ejd, we name it deleteImages 
    //so we need to add this deleteImages (but not required)to campground schema 
    //in order for the data to pass through the validation
})

module.exports.campgroundSchema = campgroundSchema

module.exports.reviewSchema = Joi.object({
    review: Joi.object({
        body: Joi.string().required().escapeHTML(),
        rating: Joi.number().required()
    }).required()
})