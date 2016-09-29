exports.DATABASE_URL = process.env.DATABASE_URL ||
                       global.DATABASE_URL ||
                       (process.env.NODE_ENV === 'production' ?
                            'mongodb://localhost/thinkful-node-capstone' :
                            'mongodb://localhost/thinkful-node-capstone-dev');
exports.PORT = process.env.PORT || 8080;