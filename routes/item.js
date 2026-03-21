/**
 * @Packages
 *  multer
 *      Multer is a node.js middleware for handling multipart/form-data,
 *      which is primarily used for uploading files. It is written on top
 *      of busboy for maximum efficiency.
 *      NOTE: Multer will not process any form which is not multipart(multipart/form-data)
 *      In case you need to handle a text-only multipart form, you should use the .none() method,
 *      like upload.none()
 */
const express        = require("express"),
      router         = express.Router(),
      Book           = require("../models/book"),
      Drama          = require("../models/drama"),
      Record         = require("../models/record"),
      Game           = require("../models/game"),
      Channel        = require("../models/channel"),
      Software       = require("../models/software"),
      Podcast        = require("../models/podcast"),
      fs             = require("fs"),
      multer         = require("multer"),
      upload         = multer({dest: 'uploads/'}),
      { isAdmin }    = require("./auth-middleware"),
      { fetchCover } = require("../services/doubanClient")

async function resolveCover(file, name) {
    if (file !== undefined) {
        return { img_data: fs.readFileSync(file.path), contentType: String };
    }
    try {
        const buffer = await fetchCover(name);
        if (buffer) return { img_data: buffer, contentType: String };
    } catch (err) {
        console.error('Douban image fetch failed:', err.message, err.cause);
    }
    return null;
}

function parseArrayFields(body, fields) {
    const result = {};
    for (const field of fields) {
        if (body[field]) result[field] = body[field].split(',');
    }
    return result;
}

/**
 * Registers standard CRUD routes for an item type.
 *
 * @param {object} config
 * @param {string}   config.type               - Route prefix and template folder (e.g. 'book')
 * @param {Model}    config.Model              - Mongoose model
 * @param {string}   config.indexVar           - Variable name passed to the index template
 * @param {Function} config.defaultData        - (body) => object with default fields for creation
 * @param {string[]} [config.arrayFields]      - Body fields to split by comma (e.g. ['genres'])
 * @param {object}   [config.inlineArrayField] - { field, addKey, deleteKey } for push/splice pattern
 * @param {string}   [config.statusField]      - Boolean field to set true on update (e.g. 'haveRead')
 * @param {boolean}  [config.setsRecurrence]   - If true, also set recurrence=1 when statusField is set
 * @param {boolean}  [config.hasRecurrence]    - If true, parseInt recurrence on update
 * @param {object}   [config.toggleField]      - { set, unset } for owned/already_owned pattern
 * @param {boolean}  [config.hasCommentaries]  - If true, pass commentaries to show template
 * @param {boolean}  [config.adminDelete]      - If false, DELETE route skips isAdmin (default: true)
 */
function registerItemRoutes({
    type, Model, indexVar, defaultData,
    arrayFields = [],
    inlineArrayField,
    statusField,
    setsRecurrence = false,
    hasRecurrence = false,
    toggleField,
    hasCommentaries = false,
    adminDelete = true,
}) {
    router.get(`/${type}/new`, isAdmin, (req, res) => {
        res.render(`${type}/new`);
    });

    router.get(`/${type}/index`, async (req, res) => {
        const items = await Model.find({});
        res.render(`${type}/index`, { [indexVar]: items });
    });

    router.get(`/${type}/:id/show`, async (req, res) => {
        const isAdminFlag = req.query.isAdmin === 'true';
        const item = await Model.findById(req.params.id);
        const vars = { isAdmin: isAdminFlag, [type]: item };
        if (hasCommentaries) vars.commentaries = item.commentaries;
        res.render(`${type}/show`, vars);
    });

    router.get(`/${type}/:id/edit`, isAdmin, async (req, res) => {
        const item = await Model.findById(req.params.id);
        res.render(`${type}/edit`, { [type]: item });
    });

    router.post(`/${type}/new`, upload.single('cover'), isAdmin, async (req, res) => {
        const data = { ...defaultData(req.body), ...parseArrayFields(req.body, arrayFields) };
        const cover = await resolveCover(req.file, req.body.name);
        if (cover) data.cover = cover;
        Model.create(data)
            .then(item => res.redirect(`/${type}/${item._id}/show?isAdmin=true`))
            .catch(err => console.error(`Failed to create a new ${type}`, err));
    });

    router.put(`/${type}/:id`, upload.single('cover'), isAdmin, async (req, res) => {
        const { id } = req.params;
        const newData = req.body;

        if (statusField && newData[statusField]) {
            newData[statusField] = true;
            if (setsRecurrence) newData.recurrence = 1;
        }
        if (toggleField) {
            if (newData[toggleField.set]) newData[toggleField.set] = true;
            if (newData[toggleField.unset]) {
                newData[toggleField.set] = false;
                delete newData[toggleField.unset];
            }
        }
        if (inlineArrayField) {
            const { field, addKey, deleteKey } = inlineArrayField;
            if (newData[addKey]) {
                const item = await Model.findById(id);
                newData[field] = [...item[field], newData[addKey]];
            } else if (newData[deleteKey]) {
                const item = await Model.findById(id);
                newData[field] = [...item[field]];
                newData[field].splice(newData[deleteKey], 1);
            }
        }
        Object.assign(newData, parseArrayFields(req.body, arrayFields));
        if (hasRecurrence && newData.recurrence) {
            newData.recurrence = parseInt(newData.recurrence);
        }
        if (req.file) {
            newData.cover = { img_data: fs.readFileSync(req.file.path), contentType: String };
        }

        const item = await Model.findByIdAndUpdate(id, newData);
        res.redirect(`/${type}/${item._id}/show?isAdmin=true`);
    });

    const deleteHandlers = adminDelete ? [isAdmin] : [];
    router.delete(`/${type}/:id`, ...deleteHandlers, async (req, res) => {
        await Model.findByIdAndDelete(req.params.id);
        res.redirect('/');
    });
}

/**
 * Registers commentary sub-routes for an item type.
 * Set fullCrud=true (channel) to also register edit/update/delete commentary routes.
 */
function registerCommentaryRoutes({ type, Model, fullCrud = false }) {
    const newGetHandlers = fullCrud ? [isAdmin] : [];
    router.get(`/${type}/:id/commentary/new`, ...newGetHandlers, async (req, res) => {
        const item = await Model.findById(req.params.id);
        res.render('shared/commentary/new', { item });
    });

    router.get(`/${type}/:id/commentary/:commentaryId`, async (req, res) => {
        const isAdminFlag = req.query.isAdmin === 'true';
        const item = await Model.findById(req.params.id);
        const commentary = item.commentaries.find(c => c.id == req.params.commentaryId);
        if (!commentary) return;
        const vars = fullCrud ? { isAdmin: isAdminFlag, [type]: item, commentary } : { commentary };
        res.render('shared/commentary/show', vars);
    });

    router.put(`/${type}/:id/commentary/new`, isAdmin, async (req, res) => {
        const newData = req.body;
        if (newData.title && newData.content) {
            const item = await Model.findById(req.params.id);
            newData.commentaries = [...item.commentaries, {
                id: Math.random().toString(16).slice(2),
                title: newData.title,
                content: newData.content
            }];
        }
        await Model.findByIdAndUpdate(req.params.id, newData);
        res.redirect(`/${type}/${req.params.id}/show?isAdmin=true`);
    });

    if (!fullCrud) return;

    router.get(`/${type}/:id/commentary/:commentaryId/edit`, isAdmin, async (req, res) => {
        const item = await Model.findById(req.params.id);
        const commentary = item.commentaries.find(c => c.id == req.params.commentaryId);
        if (commentary) res.render('shared/commentary/edit', { [type]: item, commentary });
    });

    router.put(`/${type}/:id/commentary/:commentaryId/edit`, isAdmin, async (req, res) => {
        const newData = req.body;
        if (newData.title || newData.content) {
            const item = await Model.findById(req.params.id);
            newData.commentaries = item.commentaries.map(c =>
                c.id == req.params.commentaryId
                    ? { id: c.id, title: newData.title || c.title, content: newData.content || c.content }
                    : c
            );
        }
        await Model.findByIdAndUpdate(req.params.id, newData);
        res.redirect(`/${type}/${req.params.id}/show?isAdmin=true`);
    });

    router.delete(`/${type}/:id/commentary/:commentaryId`, async (req, res) => {
        const item = await Model.findById(req.params.id);
        const commentaries = item.commentaries.filter(c => c.id != req.params.commentaryId);
        await Model.findByIdAndUpdate(req.params.id, { commentaries });
        res.redirect(`/${type}/${req.params.id}/show?isAdmin=true`);
    });
}

/* =================== Books =================== */
registerItemRoutes({
    type: 'book', Model: Book, indexVar: 'allBooks',
    defaultData: (body) => ({
        name: body.name, author: body.author, press: body.press,
        year: body.year, ISBN: body.ISBN,
        recurrence: 0, stars: 0, Comment: "", haveRead: false, excerpts: [], itemType: "book"
    }),
    inlineArrayField: { field: 'excerpts', addKey: 'add_excerpt', deleteKey: 'delete_excerpt' },
    statusField: 'haveRead', setsRecurrence: true, hasRecurrence: true, hasCommentaries: true,
});
registerCommentaryRoutes({ type: 'book', Model: Book });

/* =================== Dramas =================== */
registerItemRoutes({
    type: 'drama', Model: Drama, indexVar: 'dramas',
    defaultData: (body) => ({
        name: body.name, director: body.director, year: body.year, genres: [],
        recurrence: 0, stars: 0, lines: [], commentaries: [], haveWatched: false, itemType: "drama"
    }),
    arrayFields: ['genres'],
    inlineArrayField: { field: 'lines', addKey: 'add_line', deleteKey: 'delete_line' },
    statusField: 'haveWatched', setsRecurrence: true, hasRecurrence: true, hasCommentaries: true,
});
registerCommentaryRoutes({ type: 'drama', Model: Drama });

/* =================== Records =================== */
registerItemRoutes({
    type: 'record', Model: Record, indexVar: 'records',
    defaultData: (body) => ({
        name: body.name, artist: body.artist, genre: body.genre,
        medium: body.medium, year: body.year,
        stars: 0, comments: [], owned: false, itemType: "record"
    }),
    toggleField: { set: 'owned', unset: 'already_owned' },
    adminDelete: false,
});

/* =================== Games =================== */
registerItemRoutes({
    type: 'game', Model: Game, indexVar: 'games',
    defaultData: (body) => ({
        name: body.name, developer: body.developer, genre: body.genre, year: body.year,
        stars: 0, comments: [], havePlayed: false, itemType: "game"
    }),
    statusField: 'havePlayed',
});

/* =================== Channels =================== */
registerItemRoutes({
    type: 'channel', Model: Channel, indexVar: 'channels',
    defaultData: (body) => ({
        name: body.name, influencer: body.influencer, platforms: [], genres: [],
        stars: 0, comments: [], haveWatched: false, itemType: "channel"
    }),
    arrayFields: ['platforms', 'genres'],
    statusField: 'haveWatched', hasCommentaries: true, adminDelete: false,
});
registerCommentaryRoutes({ type: 'channel', Model: Channel, fullCrud: true });

/* =================== Software =================== */
registerItemRoutes({
    type: 'software', Model: Software, indexVar: 'softwares',
    defaultData: (body) => ({
        name: body.name, company: body.company, founders: body.founders, year: body.year,
        platforms: [], stars: 0, itemType: "software"
    }),
    arrayFields: ['platforms'],
    adminDelete: false,
});

module.exports = router;
