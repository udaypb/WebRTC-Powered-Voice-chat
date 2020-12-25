var socket = null;
var peer = null;

function start() {

    let uname = $('#username').val();
    //set username
    $('#asName').html(uname);

    $('#username').val('');

    $('#init').hide();
    $('#call').show();

    socket = io();


    //create peer id 

    peer = new Peer();

    //wait for the new peer to appear with the ID
    peer.on('open', function () {
        // $('#peerID').html(peer.id);

        socket.emit('userName', {
            userName: uname,
            peerID: peer.id
        });


    });


    //when the server says new user connected
    socket.on('newUserConnected', (data) => {
        console.log('new user connected');
        let myId = socket.id;
        let userList = data;
        $('#userList').empty();

        Object.keys(userList).forEach((id) => {
            if (id !== myId) {
                let u = userList[id];
                $('#userList').append(`<li>
                ${u.userName} <button class="btn  btn-md btn-success" id="callBtn" peerID="${u.peerID}" onclick="newCall(' ${id}', this )"> call </button> 
                <button class="btn  btn-md btn-primary" id="voiceCall-${u.peerID}" disabled=true peerID="${u.peerID}" onclick="voiceCall(' ${id}', this )"> voice call </button>
                </li>
                `);
            }
        });
    });

    getMicAccess({
        success: function (stream) {
            window.localstream = stream;
            alert('got mic access !')

        },
        error: function (err) {
            alert('cannot access mic');
            console.log('error getting mic access ', err);
        }
    });

}

function getMicAccess(callbacks) {
    navigator.getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

    var constraints = {
        video: false,
        audio: true
    }

    navigator.getUserMedia(constraints, callbacks.success, callbacks.error);
}

function voiceCall(userid, btn){
    let toCallID = $(btn).attr('peerID');
    console.log('going to voice call to ', toConnectID);

    let call = peer.call(toCallID,window.localstream);

    call.on('stream', function(stream){
        window.peer_stream = stream;
        recStream(stream,'rVoice');
    });
}

function newCall(userid, btn) {
    let toConnectID = $(btn).attr('peerID');
    console.log('going to connect to ', toConnectID);
    peer.connect(toConnectID);

    peer.on('connection', function (conn) {
        //enable voice call button
        $("#voiceCall-"+toConnectID).prop('disabled',false);

        console.log('connected to peer with peerID ', conn.peer);
    });

    peer.on('call', function (call) {
        call.answer(window.localstream);
        call.on('stream', function (stream) {
            window.peer_stream = stream;
            recStream(stream, 'rVoice');
        });
        call.on('close', function () {
            alert('call ended');
        });
    })
}

