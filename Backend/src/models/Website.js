const mongoose = require('mongoose');

const websiteSchema = new mongoose.Schema({
    project: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Project',
        required: false
    },
    logo: {
        type: String,
        required: false,
        default: 'https://www.example.com/logo.png'
    },
    seo: {
        title: {
            type: String,
            required: false,
            maxLength: 60 // Recommended SEO title length
        },
        description: {
            type: String,
            required: false,
            maxLength: 160 // Recommended SEO meta description length
        },
        keywords: {
            type: [String],
            required: false,
            default: [],
            validate: {
                validator: function (arr) {
                    return arr.length <= 10; // Limit number of keywords
                },
                message: 'Keywords should not exceed 10'
            }
        },
        canonicalUrl: {
            type: String,
            required: false
        },
        ogImage: {
            type: String,
            required: false
        },
        ogTitle: {
            type: String,
            required: false,
            maxLength: 60
        },
        ogDescription: {
            type: String,
            required: false,
            maxLength: 160
        }
    },
    components: [{
        name: {
            type: String,
            required: true // e.g., "Hero Section"
        },
        category: {
            type: String,
            default: "general" // e.g., hero, about, footer
        },
        description: {
            type: String
        },
        thumbnail: {
            type: String // URL to a preview image
        },
        code: {
            type: String,
            required: true // JSX code as string
        },
        defaultProps: {
            type: Array, // array of key-value pairs for component props
            default: [],
            validate: {
                validator: function (arr) {
                    return arr.every(prop => {
                        // Basic validation for required fields
                        if (!prop.hasOwnProperty('key') || !prop.hasOwnProperty('value') || !prop.hasOwnProperty('type')) {
                            return false;
                        }

                        // Validate supported types
                        const supportedTypes = ['string', 'number', 'boolean', 'object', 'array'];
                        if (!supportedTypes.includes(prop.type)) {
                            return false;
                        }

                        // For object and array types, validate structure
                        if (prop.type === 'object' && typeof prop.value === 'string') {
                            try {
                                JSON.parse(prop.value);
                            } catch (e) {
                                return false;
                            }
                        }

                        if (prop.type === 'array' && typeof prop.value === 'string') {
                            try {
                                const parsed = JSON.parse(prop.value);
                                return Array.isArray(parsed);
                            } catch (e) {
                                return false;
                            }
                        }

                        return true;
                    });
                },
                message: 'Each prop must have key, value, and type properties. Supported types: string, number, boolean, object, array. Object and array values must be valid JSON.'
            }
        },
        createdBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User" // admin who created the component
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        updatedAt: {
            type: Date,
            default: Date.now
        }
    }]
});


const Website = mongoose.model('Website', websiteSchema);
module.exports = Website;
