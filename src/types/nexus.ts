export type SecurityLevel = 'NORMAL' | 'ELEVATED' | 'STRICT' | 'LOCKDOWN';

export type ClassificationType = 
  | 'CONFIRMED' 
  | 'SUSPICIOUS_INDICATOR' 
  | 'UNVERIFIED_HYPOTHESIS' 
  | 'FALSE_POSITIVE_POSSIBILITY';

export type SeverityType = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export type ModuleKey = 
  | 'dashboard'
  | 'security-center'
  | 'ai-analyst'
  | 'system-monitor'
  | 'network-monitor'
  | 'firewall'
  | 'apps'
  | 'terminal'
  | 'vulnerability-scanner'
  | 'privacy-center'
  | 'file-integrity'
  | 'incident-response'
  | 'update-manager'
  | 'device-settings'
  | 'reports';

export interface SandboxApp {
  id: string;
  name: string;
  category: 'Browser' | 'Development' | 'Security' | 'Network' | 'System' | 'Communication';
  icon: string;
  pid: number | null;
  status: 'RUNNING' | 'ISOLATED' | 'STOPPED' | 'QUARANTINED';
  cpuPercent: number;
  memoryMb: number;
  seccompProfile: 'strict-bpf' | 'network-only' | 'no-net-sandbox' | 'default';
  appArmorProfile: string;
  permissions: {
    network: boolean;
    storage: 'NONE' | 'READ_ONLY' | 'SCOPED_RW' | 'FULL_RW';
    camera: boolean;
    mic: boolean;
    rawSockets: boolean;
    ipcDbus: boolean;
  };
  signatureVerified: boolean;
  signer: string;
}

export interface FIMItem {
  id: string;
  path: string;
  expectedHash: string;
  currentHash: string;
  status: 'MATCH' | 'MODIFIED' | 'TAMPERED' | 'CHECKING';
  lastChecked: string;
  immutableAttr: boolean;
  partOfBaseOS: boolean;
}

export interface NetworkConnection {
  id: string;
  proto: 'TCP' | 'UDP' | 'RAW';
  localAddr: string;
  remoteAddr: string;
  remotePort: number;
  remoteHostname: string;
  country: string;
  processName: string;
  pid: number;
  state: 'ESTABLISHED' | 'LISTEN' | 'SYN_SENT' | 'BLOCKED';
  inRateKbps: number;
  outRateKbps: number;
  dohVerified: boolean;
  suspicious: boolean;
}

export interface FirewallRule {
  id: string;
  family: 'inet';
  table: 'nexus_filter';
  chain: 'input' | 'output' | 'forward';
  proto: 'tcp' | 'udp' | 'icmp' | 'all';
  source: string;
  destPort: string;
  action: 'accept' | 'drop' | 'reject';
  comment: string;
  enabled: boolean;
  hitsCount: number;
}

export interface ThreatRecord {
  id: string;
  title: string;
  category: 'Process Anomaly' | 'Network Intrusion' | 'File Tampering' | 'Auth Abuse' | 'Privilege Escalation';
  severity: SeverityType;
  timestamp: string;
  processName: string;
  pid: number;
  details: string;
  classification: ClassificationType;
  confidenceScore: number;
  mitre: string[];
  status: 'ACTIVE' | 'INVESTIGATING' | 'QUARANTINED' | 'RESOLVED' | 'FALSE_POSITIVE';
  aiRemediation?: string[];
  remediationCommand?: string;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  subsystem: 'SYSCALL' | 'APPARMOR' | 'NFTABLES' | 'FIM' | 'PAM_AUTH' | 'SECCOMP' | 'UPDATE';
  severity: SeverityType;
  actor: string;
  action: string;
  target: string;
  result: 'PERMITTED' | 'BLOCKED' | 'ALERT';
  syscallNumber?: number;
  details: string;
}

export interface SecurityIncident {
  id: string;
  title: string;
  severity: SeverityType;
  status: 'DETECTED' | 'CONTAINED' | 'REMEDIATED' | 'CLOSED';
  rootCause: string;
  affectedProcess: string;
  affectedPid: number;
  detectedAt: string;
  correlatedEventsCount: number;
  mitreAttackId: string;
  containmentPlaybook: string;
  quarantineActive: boolean;
}

export interface VulnerabilityRecord {
  cveId: string;
  packageName: string;
  installedVersion: string;
  fixedVersion: string;
  cvssScore: number;
  severity: SeverityType;
  summary: string;
  exploitKnown: boolean;
  patchAvailable: boolean;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsedMb: number;
  memoryTotalMb: number;
  diskUsedGb: number;
  diskTotalGb: number;
  loadAverage: [number, number, number];
  uptimeSeconds: number;
  kernelVersion: string;
  osEdition: string;
  architecture: string;
  secureBootStatus: 'ACTIVE_SEALED' | 'DISABLED';
  tpmStatus: 'TPM_2_0_READY' | 'UNAVAILABLE';
  luksEncryption: 'LUKS2_AES_XTS_512' | 'DISABLED';
  rootPartitionMode: 'READ_ONLY' | 'READ_WRITE';
  appArmorStatus: 'ENFORCING' | 'COMPLAIN';
}

export interface WindowItem {
  id: string;
  title: string;
  module: ModuleKey;
  iconName: string;
  isMinimized: boolean;
  isMaximized: boolean;
  zIndex: number;
}
