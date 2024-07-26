class ApiResponse{
    constructor(stateCode ,data,message = 'success'){
        this.stateCode = stateCode
        this.data = data
        this.message = message
        this.success  = statusCode < 400
    }
}