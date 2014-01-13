$(document).ready(function() {
	/*  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  * 
	 *  Socket.io
	 *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  *  */
	var SocketBridge = {
	    socket: null,
	    initialize: function () {
	        this.socket = io.connect("/");
			//Event Listener
	        this.socket.on("onMessage", function (obj) {
	            console.log( "onMessage:", obj );
				$("#message").text("This image is a: ", obj )
	        });
	    },
		//Event trigger
	    socketIoSend: function (event, params) {
	        this.socket.emit(event, params, function (data) {

	        });
	    },
		//Error Handler
	    error: function (err) {
	        console.log("SocketBridge.err", err)
	    }
	}
	SocketBridge.initialize();
	
	//Dropzone
	$("#form").dropzone({ url: "/upload" });
});

