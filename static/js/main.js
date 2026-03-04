let ws = null;
let wangshuConnected = false;
let isConnecting = false;
const token = new URLSearchParams(window.location.search).get('token') || '';

// 检查是否有token
if (!token) {
    document.querySelector('.container').style.display = 'none';
    document.getElementById('authError').style.display = 'flex';
} else {
    document.querySelector('.container').style.display = 'block';
    document.getElementById('authError').style.display = 'none';
    connect();
    loadConfig();
}

function submitToken() {
    const token = document.getElementById('tokenInput').value.trim();
    if (token) {
        window.location.href = `?token=${token}`;
    }
}

function connect() {
    if (isConnecting || (ws && ws.readyState === WebSocket.OPEN)) {
        console.log('Already connected or connecting, skipping connection attempt');
        return;
    }
    
    isConnecting = true;
    
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/webWs?token=${token}`;
    
    $('#wsStatus').removeClass('connected disconnected').addClass('connecting');
    $('#wsStatus span').text('服务端: 连接中...');
    
    // 初始状态：禁用输入框和发送按钮
    $('#messageInput').prop('disabled', true);
    $('#sendButton').prop('disabled', true);
    
    ws = new WebSocket(wsUrl);
    
    ws.onopen = function() {
        isConnecting = false;
        $('#wsStatus').removeClass('connecting disconnected').addClass('connected');
        $('#wsStatus span').text('服务端: 已连接');
    };
    
    ws.onclose = function() {
        isConnecting = false;
        $('#wsStatus').removeClass('connected connecting').addClass('disconnected');
        $('#wsStatus span').text('服务端: 未连接');
        setTimeout(connect, 3000);
    };
    
    ws.onerror = function(error) {
        isConnecting = false;
        console.error('WebSocket error:', error);
        $('#wsStatus').removeClass('connected connecting').addClass('disconnected');
        $('#wsStatus span').text('服务端: 连接错误');
    };
    
    ws.onmessage = function(event) {
        const data = JSON.parse(event.data);
        console.log('Received WebSocket message:', data);
        
        // 处理普通消息（只有content字段且没有role字段的是望舒的回复）
        if (data.content && !data.role) {
            addMessage(data.content, 'assistant');
        }
        
        // 处理带有role字段的消息（来自其他web客户端）
        if (data.content && data.role) {
            addMessage(data.content, data.role);
        }
        
        // 处理 wangshu 连接状态
        if (data.type === 'wangshu_status') {
            if (data.status === 'connected') {
                $('#wangshuStatus').removeClass('disconnected connecting').addClass('connected');
                $('#wangshuStatus span').text('望舒: 已连接');
                wangshuConnected = true;
                $('#messageInput').prop('disabled', false);
                $('#sendButton').prop('disabled', false);
            } else {
                $('#wangshuStatus').removeClass('connected connecting').addClass('disconnected');
                $('#wangshuStatus span').text('望舒: 未连接');
                wangshuConnected = false;
                $('#messageInput').prop('disabled', true);
                $('#sendButton').prop('disabled', true);
            }
        }
    };
}

// 页面关闭时断开连接
window.addEventListener('beforeunload', function() {
    if (ws) {
        ws.close();
    }
});

function addMessage(content, type) {
    const messageDiv = $('<div>').addClass(`message ${type}`);
    
    if (type === 'assistant') {
        const contentDiv = $('<div>').addClass('message-content');
        contentDiv.html(marked.parse(content));
        messageDiv.append(contentDiv);
    } else {
        messageDiv.text(content);
    }
    
    $('#chatMessages').append(messageDiv);
    $('#chatMessages').scrollTop($('#chatMessages')[0].scrollHeight);
}

function sendMessage() {
    const content = $('#messageInput').val().trim();
    if (!content || !ws) return;

    if (!wangshuConnected) {
        alert('望舒未连接，无法发送消息。请等待望舒连接后再试。');
        return;
    }

    ws.send(JSON.stringify({
        type: 'message',
        content: content
    }));

    addMessage(content, 'user');
    $('#messageInput').val('');
}

$('#messageInput').keypress(function(e) {
    if (e.which === 13) {
        sendMessage();
    }
});

$('.nav button').click(function() {
    $('.nav button').removeClass('active');
    $(this).addClass('active');
    
    $('.content').removeClass('active');
    $(`#${$(this).data('tab')}`).addClass('active');
});

$(document).ready(function() {
    // 只有在有token时才初始化
    if (token) {
        connect();
        loadConfig();
    }
});