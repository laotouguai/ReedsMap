/**
 * Created by LaoTouGuai on 2017-06-14.
 *
 */

const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const StatusSchema = new Schema({
    title: String,
    address: Object,
    whichPoi: Number,
    location: Object,
    content: String,
    createDate: Date
});

mongoose.model('Status', StatusSchema);
