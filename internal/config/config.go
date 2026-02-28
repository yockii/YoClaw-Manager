package config

import (
	"encoding/json"
	"fmt"
	"os"
	"path/filepath"
	"sync"
)

type Config struct {
	Agents    map[string]AgentConfig    `json:"agents"`
	Providers map[string]ProviderConfig `json:"providers"`
	Channels  ChannelsConfig            `json:"channels"`
	Skill     SkillConfig               `json:"skill"`
	mu        sync.RWMutex
}

type SkillConfig struct {
	GlobalPath  string `json:"global_path"`
	BuiltInPath string `json:"builtin_path"`
}

type AgentConfig struct {
	Workspace   string  `json:"workspace"`
	Provider    string  `json:"provider"`
	Model       string  `json:"model"`
	Temperature float64 `json:"temperature"`
}

type ProviderConfig struct {
	Type    string `json:"type"`
	APIKey  string `json:"api_key"`
	BaseURL string `json:"base_url,omitempty"`
}

type ChannelsConfig struct {
	Feishu FeishuConfig `json:"feishu"`
	Web    WebConfig    `json:"web"`
}

type ChannelBaseConfig struct {
	Enabled bool   `json:"enabled"`
	Agent   string `json:"agent"`
}

type FeishuConfig struct {
	ChannelBaseConfig
	AppID     string `json:"app_id"`
	AppSecret string `json:"app_secret"`
}

type WebConfig struct {
	ChannelBaseConfig
	HostAddress string `json:"host_address"`
	Token       string `json:"token"`
}

func LoadConfig(cfgFilePath string) (*Config, error) {
	cfgPath := expandPath(cfgFilePath)

	data, err := os.ReadFile(cfgPath)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var cfg Config
	if err := json.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config file: %w", err)
	}

	return &cfg, nil
}

func SaveConfig(cfgFilePath string, cfg *Config) error {
	cfgPath := expandPath(cfgFilePath)

	data, err := json.MarshalIndent(cfg, "", "  ")
	if err != nil {
		return fmt.Errorf("failed to marshal config: %w", err)
	}

	dir := filepath.Dir(cfgPath)
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("failed to create config directory: %w", err)
	}

	if err := os.WriteFile(cfgPath, data, 0644); err != nil {
		return fmt.Errorf("failed to write config file: %w", err)
	}

	return nil
}

func expandPath(path string) string {
	if len(path) > 0 && path[0] == '~' {
		home, err := os.UserHomeDir()
		if err != nil {
			return path
		}
		if len(path) > 1 && (path[1] == '/' || path[1] == '\\') {
			return filepath.Join(home, path[2:])
		}
		return home
	}
	return path
}
