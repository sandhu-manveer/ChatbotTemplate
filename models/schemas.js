// define schemas to maintain consistency
var schemas = {
    user: {
        _id: null,
        _rev:null,
        name: null,
        password: null,
        email: null,
        role: null
    },
    feedback: {
        _id: null,
        _rev: null,
        _attachments: null,
        userId: null,
        userFeedback: null,
        watsonResponse: null,
        entity: null,
        username: null,
        userRole: null,
        docUrl: null
    }
}

module.exports = schemas;