var result ={
    set:function (state,message,data) {
        this.state = state;
        this.message = message;
        this.data = data;
    },
    error:function (message) {
        this.state = "error";
        this.message = message;
    },
    success:function (message) {
        this.state = "success";
        this.message = message;
    },
    state:"",
    message:"",
    data:null,
};

module.exports = result;