#!/usr/bin/env python3
# -*- coding: utf-8 -*-

import os
import re

base = "e:/tik/apps/web/src"

# Find all files with @ai-task-escrow/sdk imports and fix them
def fix_file_imports(file_path):
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Add local implementations at the top
        local_types = '''
// Local implementations to fix import errors
interface Task {
  taskId: string;
  creator: string;
  assignedAgent?: string;
  paymentToken: string;
  paymentAmount: string;
  feeBpsSnapshot: number;
  createdAt: number;
  acceptedAt?: number;
  deadline?: number;
  reviewTimeout?: number;
  metadataUri: string;
  resultUri?: string;
  state: TaskState;
  disputeMetadataUri?: string;
  ap2MandateHash?: string;
  x402PaymentRef?: string;
  gasUsed?: string;
  completionTime?: number;
  priorityFee?: string;
  agentReputationSnapshot?: number;
  paymentNonce?: number;
}

enum TaskState {
  Open = "Open",
  Accepted = "Accepted",
  Submitted = "Submitted",
  Approved = "Approved",
  Cancelled = "Cancelled",
  Disputed = "Disputed",
  Refunded = "Refunded",
  Resolved = "Resolved"
}

const formatAmount = (amount: string | number): string => {
  const num = Number(amount) / 1e18;
  return num.toFixed(4) + ' EGLD';
};

const formatDate = (timestamp: number): string => {
  return new Date(timestamp * 1000).toLocaleDateString();
};

const getStatusColor = (state: TaskState): string => {
  switch (state) {
    case TaskState.Open: return 'text-blue-600';
    case TaskState.Accepted: return 'text-yellow-600';
    case TaskState.Submitted: return 'text-purple-600';
    case TaskState.Approved: return 'text-green-600';
    case TaskState.Cancelled: return 'text-gray-600';
    case TaskState.Disputed: return 'text-red-600';
    case TaskState.Refunded: return 'text-orange-600';
    case TaskState.Resolved: return 'text-teal-600';
    default: return 'text-gray-600';
  }
};

'''
        
        # Remove @ai-task-escrow/sdk imports
        content = re.sub(r"import\s*\{[^}]*\}\s*from\s*'@ai-task-escrow/sdk';", '', content)
        
        # Add local implementations after the last import
        last_import = content.rfind('import')
        if last_import != -1:
            end_of_import = content.find('\n', last_import)
            if end_of_import != -1:
                content = content[:end_of_import] + local_types + content[end_of_import:]
        
        with open(file_path, 'w', encoding='utf-8') as f:
            f.write(content)
        
        print(f"✅ Fixed {file_path}")
        return True
    except Exception as e:
        print(f"❌ Error fixing {file_path}: {e}")
        return False

# Find all TypeScript files
files_to_fix = []
for root, dirs, files in os.walk(base):
    for file in files:
        if file.endswith('.tsx') or file.endswith('.ts'):
            file_path = os.path.join(root, file)
            try:
                with open(file_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if '@ai-task-escrow/sdk' in content:
                        files_to_fix.append(file_path)
            except:
                pass

print(f"🔧 Found {len(files_to_fix)} files to fix:")
for file_path in files_to_fix:
    print(f"  - {file_path}")

# Fix all files
for file_path in files_to_fix:
    fix_file_imports(file_path)

print("✅ All imports fixed!")
