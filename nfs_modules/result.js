errorType ={
    '6KG':"用于测试的错误类型",
    'M5L':"用于测试的错误类型",
    'iA5':"用于测试的错误类型",
    'pa5':"用于测试的错误类型",
}
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