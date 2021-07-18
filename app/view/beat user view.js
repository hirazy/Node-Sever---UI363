const BaseView = require('./base');

class BeatUserView extends BaseView{
    constructor(o){
        super(o);
        this.name = o.name;
        this.joinTime = o.joinTime;
    }
    
    Compact(){
        let ret = {};
        ret.name = this.name?this.name:'';
        ret.joinTime = this.joinTime?this.joinTime:'';


        return ret;
    }
    Full(){
        return this;
    }
}

module.exports = BeatUserView;

