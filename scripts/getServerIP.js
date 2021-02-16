/**
 * @brief get the ip address of server
 */
Test = () =>{
    console.log("Test")
}
getIPAddress = () =>{
    console.log("Enter into the getIPAddress function")
    var interfaces = require('os').networkInterfaces();　　
    for (var devName in interfaces) {　　　　
        var iface = interfaces[devName];　　　　　　
        for (var i = 0; i < iface.length; i++) {
            var alias = iface[i];
            if (alias.family === 'IPv4' && alias.address !== '127.0.0.1' && !alias.internal) {
                return alias.address;
            }
        }　　
    }
}

Test()
getIPAddress()
var ip = 'empty_ip'
console.log("\n--------IP地址：" + ip+ "------\n");