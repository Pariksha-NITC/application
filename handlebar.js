const { options } = require("./routes");

module.exports = {
    ife : function(var1,var2,options){
    if(var1 == var2)
        return options.fn(this);
    else
        return options.inverse(this);
    },
    inc : function(options){
        return String(parseInt(options.fn(this))+1);
    }, 
    dec : function(options){
        return String(parseInt(options.fn(this))-1);
    },
    in : function(var1,arr,options){
        for(let i = 0;i<arr.length;i++)
        {
            if(var1 == arr[i])
                return options.fn(this);
        }
        return options.inverse(this);
    },
    loop : function(var1,options){
        let ret="";
        for(let i = 0;i<var1;i++)
        {
            ret = ret + options.fn(i);
        }
        return ret;
    }
}
