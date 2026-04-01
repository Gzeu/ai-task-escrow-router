# AI Task Escrow Router - Production Monitoring Setup Script v0.3.0
# PowerShell script for setting up production monitoring and alerts

param(
    [Parameter(Mandatory=$true)]
    [string]$ContractAddress,
    
    [Parameter(Mandatory=$false)]
    [string]$WebhookUrl = "",
    
    [Parameter(Mandatory=$false)]
    [string]$EmailRecipients = "",
    
    [Parameter(Mandatory=$false)]
    [switch]$SkipDocker
)

# Configuration
$MONITORING_DIR = "monitoring"
$PROMETHEUS_PORT = "9090"
$GRAFANA_PORT = "3000"
$ALERTMANAGER_PORT = "9093"
$NODE_EXPORTER_PORT = "9100"

# Colors for output
$Green = "Green"
$Yellow = "Yellow"
$Red = "Red"
$Cyan = "Cyan"

function Write-ColorOutput {
    param([string]$Message, [string]$Color = "White")
    Write-Host $Message -ForegroundColor $Color
}

function Test-Command {
    param([string]$Command)
    try {
        $null = Get-Command $Command -ErrorAction Stop
        return $true
    } catch {
        return $false
    }
}

function New-MonitoringDirectory {
    if (-not (Test-Path $MONITORING_DIR)) {
        New-Item -ItemType Directory -Path $MONITORING_DIR -Force
        Write-ColorOutput "✅ Created monitoring directory: $MONITORING_DIR" $Green
    }
}

function New-PrometheusConfig {
    $prometheusConfig = @"
global:
  scrape_interval: 15s
  evaluation_interval: 15s

rule_files:
  - "alert_rules.yml"

alerting:
  alertmanagers:
    - static_configs:
        - targets:
          - alertmanager:9093

scrape_configs:
  - job_name: 'prometheus'
    static_configs:
      - targets: ['localhost:9090']

  - job_name: 'node-exporter'
    static_configs:
      - targets: ['localhost:9100']

  - job_name: 'multiversx-contract'
    static_configs:
      - targets: ['localhost:8080']
    scrape_interval: 30s
    metrics_path: '/metrics'
    params:
      contract: ['$ContractAddress']

  - job_name: 'ai-task-escrow-frontend'
    static_configs:
      - targets: ['localhost:3000']
    scrape_interval: 30s
    metrics_path: '/api/metrics'
"@
    
    $prometheusConfig | Out-File -FilePath "$MONITORING_DIR\prometheus.yml" -Encoding UTF8
    Write-ColorOutput "✅ Created Prometheus configuration" $Green
}

function New-AlertRules {
    $alertRules = @"
groups:
  - name: ai-task-escrow-alerts
    rules:
      # Contract Health Alerts
      - alert: ContractDown
        expr: up{job="multiversx-contract"} == 0
        for: 1m
        labels:
          severity: critical
        annotations:
          summary: "AI Task Escrow contract is down"
          description: "Contract {{ $labels.instance }} has been down for more than 1 minute."

      - alert: ContractGasUsageHigh
        expr: contract_gas_usage_rate > 1000000
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High gas usage detected"
          description: "Contract gas usage is {{ $value }} gas/second."

      # Performance Alerts
      - alert: HighResponseTime
        expr: contract_response_time_seconds > 5
        for: 2m
        labels:
          severity: warning
        annotations:
          summary: "High response time detected"
          description: "Contract response time is {{ $value }} seconds."

      - alert: ErrorRateHigh
        expr: contract_error_rate > 0.05
        for: 3m
        labels:
          severity: critical
        annotations:
          summary: "High error rate detected"
          description: "Contract error rate is {{ $value | humanizePercentage }}."

      # Business Metrics Alerts
      - alert: LowTaskCreationRate
        expr: task_creation_rate < 0.1
        for: 10m
        labels:
          severity: warning
        annotations:
          summary: "Low task creation rate"
          description: "Task creation rate is {{ $value }} tasks/minute."

      - alert: HighDisputeRate
        expr: dispute_rate > 0.1
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High dispute rate"
          description: "Dispute rate is {{ $value | humanizePercentage }}."

      - alert: ReputationScoreDrop
        expr: avg_reputation_score < 500
        for: 15m
        labels:
          severity: warning
        annotations:
          summary: "Average reputation score dropped"
          description: "Average reputation score is {{ $value }}."

      # System Alerts
      - alert: HighCPUUsage
        expr: 100 - (avg by(instance) (irate(node_cpu_seconds_total{mode="idle"}[5m])) * 100) > 80
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High CPU usage"
          description: "CPU usage is {{ $value }}%."

      - alert: HighMemoryUsage
        expr: (1 - (node_memory_MemAvailable_bytes / node_memory_MemTotal_bytes)) * 100 > 85
        for: 5m
        labels:
          severity: warning
        annotations:
          summary: "High memory usage"
          description: "Memory usage is {{ $value }}%."

      - alert: DiskSpaceLow
        expr: (1 - (node_filesystem_avail_bytes / node_filesystem_size_bytes)) * 100 > 90
        for: 5m
        labels:
          severity: critical
        annotations:
          summary: "Low disk space"
          description: "Disk usage is {{ $value }}%."
"@
    
    $alertRules | Out-File -FilePath "$MONITORING_DIR\alert_rules.yml" -Encoding UTF8
    Write-ColorOutput "✅ Created alert rules" $Green
}

function New-AlertManagerConfig {
    $alertManagerConfig = @"
global:
  smtp_smarthost: 'localhost:587'
  smtp_from: 'alerts@ai-task-escrow.com'

route:
  group_by: ['alertname']
  group_wait: 10s
  group_interval: 10s
  repeat_interval: 1h
  receiver: 'web.hook'
  routes:
    - match:
        severity: critical
      receiver: 'critical-alerts'
    - match:
        severity: warning
      receiver: 'warning-alerts'

receivers:
  - name: 'web.hook'
    webhook_configs:
      - url: '$WebhookUrl'
        send_resolved: true

  - name: 'critical-alerts'
    email_configs:
      - to: '$EmailRecipients'
        subject: '[CRITICAL] AI Task Escrow Alert'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Labels: {{ range .Labels.SortedPairs }}{{ .Name }}={{ .Value }} {{ end }}
          {{ end }}

  - name: 'warning-alerts'
    email_configs:
      - to: '$EmailRecipients'
        subject: '[WARNING] AI Task Escrow Alert'
        body: |
          {{ range .Alerts }}
          Alert: {{ .Annotations.summary }}
          Description: {{ .Annotations.description }}
          Labels: {{ range .Labels.SortedPairs }}{{ .Name }}={{ .Value }} {{ end }}
          {{ end }}

inhibit_rules:
  - source_match:
      severity: 'critical'
    target_match:
      severity: 'warning'
    equal: ['alertname', 'dev', 'instance']
"@
    
    $alertManagerConfig | Out-File -FilePath "$MONITORING_DIR\alertmanager.yml" -Encoding UTF8
    Write-ColorOutput "✅ Created AlertManager configuration" $Green
}

function New-GrafanaDashboard {
    $dashboard = @"
{
  "dashboard": {
    "id": null,
    "title": "AI Task Escrow Router - Production Dashboard",
    "tags": ["ai-task-escrow", "production"],
    "timezone": "browser",
    "panels": [
      {
        "id": 1,
        "title": "Contract Health",
        "type": "stat",
        "targets": [
          {
            "expr": "up{job=\"multiversx-contract\"}",
            "legendFormat": "Contract Status"
          }
        ],
        "fieldConfig": {
          "defaults": {
            "mappings": [
              {
                "options": {
                  "0": {
                    "text": "DOWN",
                    "color": "red"
                  },
                  "1": {
                    "text": "UP",
                    "color": "green"
                  }
                },
                "type": "value"
              }
            ]
          }
        },
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 0,
          "y": 0
        }
      },
      {
        "id": 2,
        "title": "Gas Usage Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(contract_gas_usage_total[5m])",
            "legendFormat": "Gas Usage Rate"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 12,
          "y": 0
        }
      },
      {
        "id": 3,
        "title": "Task Creation Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(tasks_created_total[5m])",
            "legendFormat": "Tasks/minute"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 0,
          "y": 8
        }
      },
      {
        "id": 4,
        "title": "Average Reputation Score",
        "type": "graph",
        "targets": [
          {
            "expr": "avg_reputation_score",
            "legendFormat": "Avg Reputation"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 12,
          "y": 8
        }
      },
      {
        "id": 5,
        "title": "Error Rate",
        "type": "graph",
        "targets": [
          {
            "expr": "rate(contract_errors_total[5m])",
            "legendFormat": "Errors/second"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 0,
          "y": 16
        }
      },
      {
        "id": 6,
        "title": "Response Time",
        "type": "graph",
        "targets": [
          {
            "expr": "contract_response_time_seconds",
            "legendFormat": "Response Time (s)"
          }
        ],
        "gridPos": {
          "h": 8,
          "w": 12,
          "x": 12,
          "y": 16
        }
      }
    ],
    "time": {
      "from": "now-1h",
      "to": "now"
    },
    "refresh": "5s"
  }
}
"@
    
    $dashboard | Out-File -FilePath "$MONITORING_DIR\grafana-dashboard.json" -Encoding UTF8
    Write-ColorOutput "✅ Created Grafana dashboard" $Green
}

function New-DockerCompose {
    $dockerCompose = @"
version: '3.8'

services:
  prometheus:
    image: prom/prometheus:latest
    container_name: ai-task-escrow-prometheus
    ports:
      - "$PROMETHEUS_PORT:9090"
    volumes:
      - ./prometheus.yml:/etc/prometheus/prometheus.yml
      - ./alert_rules.yml:/etc/prometheus/alert_rules.yml
      - prometheus_data:/prometheus
    command:
      - '--config.file=/etc/prometheus/prometheus.yml'
      - '--storage.tsdb.path=/prometheus'
      - '--web.console.libraries=/etc/prometheus/console_libraries'
      - '--web.console.templates=/etc/prometheus/consoles'
      - '--storage.tsdb.retention.time=200h'
      - '--web.enable-lifecycle'
    networks:
      - monitoring

  grafana:
    image: grafana/grafana:latest
    container_name: ai-task-escrow-grafana
    ports:
      - "$GRAFANA_PORT:3000"
    volumes:
      - grafana_data:/var/lib/grafana
      - ./grafana-dashboard.json:/etc/grafana/provisioning/dashboards/dashboard.json
    environment:
      - GF_SECURITY_ADMIN_PASSWORD=admin123
      - GF_USERS_ALLOW_SIGN_UP=false
    networks:
      - monitoring
    depends_on:
      - prometheus

  alertmanager:
    image: prom/alertmanager:latest
    container_name: ai-task-escrow-alertmanager
    ports:
      - "$ALERTMANAGER_PORT:9093"
    volumes:
      - ./alertmanager.yml:/etc/alertmanager/alertmanager.yml
      - alertmanager_data:/alertmanager
    networks:
      - monitoring
    depends_on:
      - prometheus

  node-exporter:
    image: prom/node-exporter:latest
    container_name: ai-task-escrow-node-exporter
    ports:
      - "$NODE_EXPORTER_PORT:9100"
    volumes:
      - /proc:/host/proc:ro
      - /sys:/host/sys:ro
      - /:/rootfs:ro
    command:
      - '--path.procfs=/host/proc'
      - '--path.rootfs=/rootfs'
      - '--path.sysfs=/host/sys'
      - '--collector.filesystem.mount-points-exclude=^/(sys|proc|dev|host|etc)($$|/)'
    networks:
      - monitoring

volumes:
  prometheus_data:
  grafana_data:
  alertmanager_data:

networks:
  monitoring:
    driver: bridge
"@
    
    $dockerCompose | Out-File -FilePath "$MONITORING_DIR\docker-compose.yml" -Encoding UTF8
    Write-ColorOutput "✅ Created Docker Compose configuration" $Green
}

function Start-Monitoring {
    Write-ColorOutput "🚀 Starting monitoring stack..." $Cyan
    
    Set-Location $MONITORING_DIR
    
    if (Test-Command "docker-compose") {
        $result = docker-compose up -d
        if ($LASTEXITCODE -eq 0) {
            Write-ColorOutput "✅ Monitoring stack started successfully" $Green
            Write-ColorOutput "📊 Prometheus: http://localhost:$PROMETHEUS_PORT" $Cyan
            Write-ColorOutput "📈 Grafana: http://localhost:$GRAFANA_PORT (admin/admin123)" $Cyan
            Write-ColorOutput "🚨 AlertManager: http://localhost:$ALERTMANAGER_PORT" $Cyan
        } else {
            Write-ColorOutput "❌ Failed to start monitoring stack" $Red
        }
    } else {
        Write-ColorOutput "❌ Docker Compose not found" $Red
        Write-ColorOutput "Please install Docker and Docker Compose" $Red
    }
}

function New-MonitoringScript {
    $script = @"
# AI Task Escrow Router - Monitoring Start Script
# Run this script to start the monitoring stack

Write-Host "Starting AI Task Escrow Router Monitoring Stack..." -ForegroundColor Cyan

# Navigate to monitoring directory
Set-Location monitoring

# Start Docker Compose
docker-compose up -d

# Wait for services to start
Start-Sleep -Seconds 10

# Display URLs
Write-Host "Monitoring services are running:" -ForegroundColor Green
Write-Host "Prometheus: http://localhost:9090" -ForegroundColor Cyan
Write-Host "Grafana: http://localhost:3000 (admin/admin123)" -ForegroundColor Cyan
Write-Host "AlertManager: http://localhost:9093" -ForegroundColor Cyan

Write-Host "Monitoring stack started successfully!" -ForegroundColor Green
"@
    
    $script | Out-File -FilePath "$MONITORING_DIR\start-monitoring.ps1" -Encoding UTF8
    Write-ColorOutput "✅ Created monitoring start script" $Green
}

# Main execution
function Main {
    Write-ColorOutput "🔧 AI Task Escrow Router - Production Monitoring Setup v0.3.0" $Cyan
    Write-ColorOutput "=======================================================" $Cyan
    Write-ColorOutput "Contract Address: $ContractAddress" $Yellow
    Write-Host ""
    
    # Create monitoring directory
    New-MonitoringDirectory
    
    # Create configuration files
    Write-ColorOutput "📝 Creating monitoring configuration files..." $Cyan
    
    New-PrometheusConfig
    New-AlertRules
    New-AlertManagerConfig
    New-GrafanaDashboard
    New-DockerCompose
    New-MonitoringScript
    
    Write-ColorOutput "✅ All configuration files created" $Green
    Write-Host ""
    
    # Start monitoring stack
    if (-not $SkipDocker) {
        Start-Monitoring
    }
    
    Write-Host ""
    Write-ColorOutput "🎉 Monitoring setup complete!" $Green
    Write-ColorOutput "=============================" $Green
    Write-Host ""
    Write-ColorOutput "📊 Monitoring Services:" $Cyan
    Write-ColorOutput "• Prometheus: http://localhost:$PROMETHEUS_PORT" $Cyan
    Write-ColorOutput "• Grafana: http://localhost:$GRAFANA_PORT (admin/admin123)" $Cyan
    Write-ColorOutput "• AlertManager: http://localhost:$ALERTMANAGER_PORT" $Cyan
    Write-Host ""
    Write-ColorOutput "📁 Configuration files created in: $MONITORING_DIR" $Green
    Write-ColorOutput "🚀 Start monitoring: .\$MONITORING_DIR\start-monitoring.ps1" $Green
    Write-Host ""
    Write-ColorOutput "⚠️  Don't forget to:" $Yellow
    Write-ColorOutput "1. Configure webhook URL for alerts" $Yellow
    Write-ColorOutput "2. Set up email recipients for notifications" $Yellow
    Write-ColorOutput "3. Import Grafana dashboard" $Yellow
    Write-ColorOutput "4. Test alert rules" $Yellow
    Write-Host ""
    Write-ColorOutput "🔍 Monitoring is now tracking your AI Task Escrow Router contract!" $Green
}

# Execute main function
try {
    Main
} catch {
    Write-ColorOutput "❌ Fatal error: $($_.Exception.Message)" $Red
    exit 1
}
