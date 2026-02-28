let currentConfig = null;

function loadConfig() {
    const token = new URLSearchParams(window.location.search).get('token') || 'default';
    $.ajax({
        url: `/api/config?token=${token}`,
        method: 'GET',
        success: function(response) {
            currentConfig = response.config;
            renderConfig();
            initCronAgentSelect(); // 初始化定时任务的Agent选择
            initTasksAgentSelect(); // 初始化任务的Agent选择
            initSessionsAgentSelect(); // 初始化会话的Agent选择
        },
        error: function(xhr, status, error) {
            console.error('Failed to load config:', error);
        }
    });
}

function renderConfig() {
    renderAgents();
    renderProviders();
    renderChannels();
    renderSkill();
}

function renderAgents() {
    const container = $('#agentsList');
    container.empty();
    
    if (!currentConfig.agents) return;
    
    const agentCount = Object.keys(currentConfig.agents).length;
    
    Object.keys(currentConfig.agents).forEach(key => {
        const agent = currentConfig.agents[key];
        const providerOptions = Object.keys(currentConfig.providers || {}).map(providerKey => 
            `<option value="${providerKey}" ${agent.provider === providerKey ? 'selected' : ''}>${providerKey}</option>`
        ).join('');
        
        const deleteButton = agentCount > 1 ? `<button class="delete-btn" onclick="deleteAgent('${key}')">删除</button>` : '';
        
        const html = `
            <div class="agent-item" data-key="${key}">
                <h4>${key} ${deleteButton}</h4>
                <div class="form-group">
                    <label>Workspace</label>
                    <input type="text" class="agent-workspace" value="${agent.workspace || ''}">
                </div>
                <div class="form-group">
                    <label>Provider</label>
                    <select class="agent-provider">
                        ${providerOptions || '<option value="">无</option>'}
                    </select>
                </div>
                <div class="form-group">
                    <label>Model</label>
                    <input type="text" class="agent-model" value="${agent.model || ''}">
                </div>
                <div class="form-group">
                    <label>Temperature</label>
                    <input type="number" step="0.1" class="agent-temperature" value="${agent.temperature || 0.7}">
                </div>
            </div>
        `;
        container.append(html);
    });
}

function renderProviders() {
    const container = $('#providersList');
    container.empty();
    
    if (!currentConfig.providers) return;
    
    // 支持的provider类型
    const providerTypes = ['openai', 'anthropic', 'google', 'azure', 'baidu', 'other'];
    
    const providerCount = Object.keys(currentConfig.providers).length;
    
    Object.keys(currentConfig.providers).forEach(key => {
        const provider = currentConfig.providers[key];
        const typeOptions = providerTypes.map(type => 
            `<option value="${type}" ${provider.type === type ? 'selected' : ''}>${type.charAt(0).toUpperCase() + type.slice(1)}</option>`
        ).join('');
        
        const deleteButton = providerCount > 1 ? `<button class="delete-btn" onclick="deleteProvider('${key}')">删除</button>` : '';
        
        const html = `
            <div class="provider-item" data-key="${key}">
                <h4>${key} ${deleteButton}</h4>
                <div class="form-group">
                    <label>Type</label>
                    <select class="provider-type">
                        ${typeOptions}
                    </select>
                </div>
                <div class="form-group">
                    <label>API Key</label>
                    <input type="text" class="provider-api-key" value="${provider.api_key || ''}">
                </div>
                <div class="form-group">
                    <label>Base URL</label>
                    <input type="text" class="provider-base-url" value="${provider.base_url || ''}">
                </div>
            </div>
        `;
        container.append(html);
    });
}

function renderChannels() {
    if (!currentConfig.channels) return;
    
    const channelsContainer = $('#configChannels');
    const channelTabs = channelsContainer.find('.config-subtabs');
    channelTabs.empty();
    
    Object.keys(currentConfig.channels).forEach(channelKey => {
        const channel = currentConfig.channels[channelKey];
        const tabButton = $(`<button class="config-subtab" data-channel-tab="${channelKey}">${channelKey.charAt(0).toUpperCase() + channelKey.slice(1)}</button>`);
        channelTabs.append(tabButton);
        
        const channelContent = $(`<div id="channel${channelKey.charAt(0).toUpperCase() + channelKey.slice(1)}" class="channel-content">
            <h4>${channelKey.charAt(0).toUpperCase() + channelKey.slice(1)} 配置</h4>
            <div id="${channelKey}Config" class="channel-config"></div>
        </div>`);
        channelsContainer.append(channelContent);
        
        // 渲染通道配置
        renderChannelConfig(channelKey, channel);
    });
    
    // 激活第一个通道
    if (Object.keys(currentConfig.channels).length > 0) {
        const firstChannel = Object.keys(currentConfig.channels)[0];
        channelTabs.find('.config-subtab').first().addClass('active');
        channelsContainer.find('.channel-content').first().addClass('active');
    }
    
    // 绑定通道切换事件
    $('.config-subtab').click(function() {
        $('.config-subtab').removeClass('active');
        $(this).addClass('active');
        
        $('.channel-content').removeClass('active');
        $(`#channel${$(this).data('channel-tab').charAt(0).toUpperCase() + $(this).data('channel-tab').slice(1)}`).addClass('active');
    });
}

function renderChannelConfig(channelKey, channel) {
    const container = $(`#${channelKey}Config`);
    let html = '<div class="config-form">';
    
    // 基础配置
    html += `
        <div class="form-group">
            <label>Enabled</label>
            <select id="${channelKey}-enabled">
                <option value="true" ${channel.enabled ? 'selected' : ''}>是</option>
                <option value="false" ${!channel.enabled ? 'selected' : ''}>否</option>
            </select>
        </div>
    `;
    
    // Agent选择（如果通道有agent配置）
    if (channel.agent !== undefined) {
        const agentOptions = Object.keys(currentConfig.agents || {}).map(agentKey => 
            `<option value="${agentKey}" ${channel.agent === agentKey ? 'selected' : ''}>${agentKey}</option>`
        ).join('');
        
        html += `
            <div class="form-group">
                <label>Agent</label>
                <select id="${channelKey}-agent">
                    ${agentOptions || '<option value="">无</option>'}
                </select>
            </div>
        `;
    }
    
    // 其他配置项
    Object.keys(channel).forEach(key => {
        if (key !== 'enabled' && key !== 'agent') {
            html += `
                <div class="form-group">
                    <label>${key.charAt(0).toUpperCase() + key.slice(1)}</label>
                    <input type="text" id="${channelKey}-${key}" value="${channel[key] || ''}">
                </div>
            `;
        }
    });
    
    html += '</div>';
    container.html(html);
}

function renderSkill() {
    if (!currentConfig.skill) return;
    
    const skill = currentConfig.skill;
    $('#skillConfig').html(`
        <div class="config-form">
            <div class="form-group">
                <label>Global Path</label>
                <input type="text" id="skill-global-path" value="${skill.global_path || ''}">
            </div>
            <div class="form-group">
                <label>Built-in Path</label>
                <input type="text" id="skill-builtin-path" value="${skill.builtin_path || ''}">
            </div>
        </div>
    `);
}

function saveConfig() {
    const token = new URLSearchParams(window.location.search).get('token') || 'default';
    
    const newConfig = {
        agents: {},
        providers: {},
        channels: {
            feishu: {},
            web: {}
        },
        skill: {}
    };
    
    $('.agent-item').each(function() {
        const key = $(this).data('key');
        newConfig.agents[key] = {
            workspace: $(this).find('.agent-workspace').val(),
            provider: $(this).find('.agent-provider').val(),
            model: $(this).find('.agent-model').val(),
            temperature: parseFloat($(this).find('.agent-temperature').val())
        };
    });
    
    $('.provider-item').each(function() {
        const key = $(this).data('key');
        newConfig.providers[key] = {
            type: $(this).find('.provider-type').val(),
            api_key: $(this).find('.provider-api-key').val(),
            base_url: $(this).find('.provider-base-url').val()
        };
    });
    
    newConfig.channels.feishu = {
        enabled: $('#feishu-enabled').val() === 'true',
        agent: $('#feishu-agent').val(),
        app_id: $('#feishu-app-id').val(),
        app_secret: $('#feishu-app-secret').val()
    };
    
    newConfig.channels.web = {
        enabled: $('#web-enabled').val() === 'true',
        agent: $('#web-agent').val(),
        host_address: $('#web-host-address').val(),
        token: $('#web-token').val()
    };
    
    newConfig.skill = {
        global_path: $('#skill-global-path').val(),
        builtin_path: $('#skill-builtin-path').val()
    };
    
    $.ajax({
        url: `/api/config?token=${token}`,
        method: 'PUT',
        contentType: 'application/json',
        data: JSON.stringify(newConfig),
        success: function(response) {
            alert('配置保存成功！');
            loadConfig();
        },
        error: function(xhr, status, error) {
            alert('配置保存失败：' + error);
        }
    });
}

function addAgent() {
    const key = prompt('请输入 Agent 名称：');
    if (!key) return;
    
    if (!currentConfig.agents) currentConfig.agents = {};
    currentConfig.agents[key] = {
        workspace: '',
        provider: '',
        model: '',
        temperature: 0.7
    };
    renderAgents();
}

function deleteAgent(key) {
    if (Object.keys(currentConfig.agents).length <= 1) {
        alert('至少需要保留一个 Agent');
        return;
    }
    if (!confirm('确定要删除这个 Agent 吗？')) return;
    delete currentConfig.agents[key];
    renderAgents();
    renderChannels(); // 重新渲染channels，因为agent选择可能需要更新
}

function addProvider() {
    const key = prompt('请输入 Provider 名称：');
    if (!key) return;
    
    if (!currentConfig.providers) currentConfig.providers = {};
    currentConfig.providers[key] = {
        type: '',
        api_key: '',
        base_url: ''
    };
    renderProviders();
}

function deleteProvider(key) {
    if (Object.keys(currentConfig.providers).length <= 1) {
        alert('至少需要保留一个 Provider');
        return;
    }
    if (!confirm('确定要删除这个 Provider 吗？')) return;
    delete currentConfig.providers[key];
    renderProviders();
    renderAgents(); // 重新渲染agents，因为provider选择可能需要更新
}

$('.config-tab').click(function() {
    $('.config-tab').removeClass('active');
    $(this).addClass('active');
    
    $('.config-content').removeClass('active');
    $(`#config${$(this).data('config-tab').charAt(0).toUpperCase() + $(this).data('config-tab').slice(1)}`).addClass('active');
});

$('.config-subtab').click(function() {
    $('.config-subtab').removeClass('active');
    $(this).addClass('active');
    
    $('.channel-content').removeClass('active');
    $(`#channel${$(this).data('channel-tab').charAt(0).toUpperCase() + $(this).data('channel-tab').slice(1)}`).addClass('active');
});