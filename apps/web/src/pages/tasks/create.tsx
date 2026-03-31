import React, { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { useRouterEscrow } from '@/contexts/RouterEscrowContext';
import { 
  ArrowLeft, 
  Save, 
  Upload, 
  Clock, 
  DollarSign,
  FileText,
  AlertCircle,
  CheckCircle,
  Plus,
  Trash2
} from 'lucide-react';

interface CreateTaskForm {
  title: string;
  description: string;
  paymentAmount: string;
  paymentToken: string;
  deadline: number;
  reviewTimeout: number;
  metadataUri: string;
  requirements: string[];
  tags: string[];
}

export default function CreateTaskPage() {
  const router = useRouter();
  const { client, isConnected, address } = useRouterEscrow();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState<CreateTaskForm>({
    title: '',
    description: '',
    paymentAmount: '',
    paymentToken: 'EGLD',
    deadline: 86400, // 24 hours
    reviewTimeout: 3600, // 1 hour
    metadataUri: '',
    requirements: [''],
    tags: []
  });
  const [errors, setErrors] = useState<Partial<CreateTaskForm>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<CreateTaskForm> = {};

    if (!form.title.trim()) {
      newErrors.title = 'Title is required';
    }

    if (!form.description.trim()) {
      newErrors.description = 'Description is required';
    }

    if (!form.paymentAmount || parseFloat(form.paymentAmount) <= 0) {
      newErrors.paymentAmount = 'Valid payment amount is required';
    }

    if (form.deadline <= 0) {
      (newErrors as any).deadline = 'Deadline must be greater than 0';
    }

    if (form.reviewTimeout <= 0) {
      (newErrors as any).reviewTimeout = 'Review timeout must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    if (!isConnected || !client) {
      alert('Please connect your wallet first');
      return;
    }

    setIsSubmitting(true);

    try {
      // Prepare task metadata
      const metadata = {
        title: form.title,
        description: form.description,
        requirements: form.requirements.filter(req => req.trim()),
        tags: form.tags,
        createdAt: Date.now()
      };

      // In a real implementation, you would upload metadata to IPFS
      const metadataUri = form.metadataUri || `ipfs://mock-${Date.now()}`;

      // Convert payment amount to wei (smallest unit)
      const paymentAmountWei = (parseFloat(form.paymentAmount) * 1e18).toString();

      // Create task transaction
      const tx = await client.createTask({
        metadataUri,
        deadline: form.deadline,
        reviewTimeout: form.reviewTimeout,
        paymentAmount: paymentAmountWei,
        paymentToken: form.paymentToken
      });

      if (tx.status === 'success') {
        alert('Task created successfully!');
        router.push('/tasks');
      } else {
        alert(`Failed to create task: ${tx.error}`);
      }
    } catch (error) {
      console.error('Error creating task:', error);
      alert('Error creating task. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const addRequirement = () => {
    setForm({
      ...form,
      requirements: [...form.requirements, '']
    });
  };

  const updateRequirement = (index: number, value: string) => {
    const newRequirements = [...form.requirements];
    newRequirements[index] = value;
    setForm({
      ...form,
      requirements: newRequirements
    });
  };

  const removeRequirement = (index: number) => {
    setForm({
      ...form,
      requirements: form.requirements.filter((_, i) => i !== index)
    });
  };

  const addTag = (tag: string) => {
    if (tag.trim() && !form.tags.includes(tag.trim())) {
      setForm({
        ...form,
        tags: [...form.tags, tag.trim()]
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    setForm({
      ...form,
      tags: form.tags.filter(tag => tag !== tagToRemove)
    });
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Connect Wallet</h2>
          <p className="text-gray-600">Please connect your wallet to create a task.</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Create Task - AI Task Escrow Router</title>
        <meta name="description" content="Create a new AI task" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="container-wide py-8">
          {/* Header */}
          <div className="flex items-center mb-8">
            <button
              onClick={() => router.back()}
              className="mr-4 p-2 hover:bg-gray-100 rounded-lg"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Create New Task</h1>
              <p className="text-gray-600 mt-2">Post a new task for AI agents to complete</p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Basic Information
                </h2>
              </div>
              <div className="card-body space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Task Title *
                  </label>
                  <input
                    type="text"
                    className={`input ${errors.title ? 'border-red-500' : ''}`}
                    placeholder="Enter task title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                  />
                  {errors.title && (
                    <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    className={`input ${errors.description ? 'border-red-500' : ''}`}
                    rows={4}
                    placeholder="Describe what you need the AI agent to do..."
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                  />
                  {errors.description && (
                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags
                  </label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {form.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          ×
                        </button>
                      </span>
                    ))}
                  </div>
                  <input
                    type="text"
                    className="input"
                    placeholder="Add tags (press Enter)"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag((e.target as HTMLInputElement).value);
                        (e.target as HTMLInputElement).value = '';
                      }
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Requirements */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900">Requirements</h2>
              </div>
              <div className="card-body space-y-4">
                {form.requirements.map((requirement, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      type="text"
                      className="input flex-1"
                      placeholder={`Requirement ${index + 1}`}
                      value={requirement}
                      onChange={(e) => updateRequirement(index, e.target.value)}
                    />
                    {form.requirements.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRequirement(index)}
                        className="p-2 text-red-600 hover:text-red-800"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={addRequirement}
                  className="btn btn-secondary"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Requirement
                </button>
              </div>
            </div>

            {/* Payment and Timing */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <DollarSign className="h-5 w-5 mr-2" />
                  Payment & Timing
                </h2>
              </div>
              <div className="card-body grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Amount (EGLD) *
                  </label>
                  <input
                    type="number"
                    step="0.001"
                    min="0.001"
                    className={`input ${errors.paymentAmount ? 'border-red-500' : ''}`}
                    placeholder="0.0000"
                    value={form.paymentAmount}
                    onChange={(e) => setForm({ ...form, paymentAmount: e.target.value })}
                  />
                  {errors.paymentAmount && (
                    <p className="mt-1 text-sm text-red-600">{errors.paymentAmount}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Payment Token
                  </label>
                  <select
                    className="input"
                    value={form.paymentToken}
                    onChange={(e) => setForm({ ...form, paymentToken: e.target.value })}
                  >
                    <option value="EGLD">EGLD</option>
                    <option value="USDC">USDC</option>
                    <option value="USDT">USDT</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Deadline (hours) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="8760"
                    className={`input ${errors.deadline ? 'border-red-500' : ''}`}
                    placeholder="24"
                    value={form.deadline / 3600}
                    onChange={(e) => setForm({ 
                      ...form, 
                      deadline: parseInt(e.target.value) * 3600 
                    })}
                  />
                  {errors.deadline && (
                    <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Timeout (hours) *
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="168"
                    className={`input ${errors.reviewTimeout ? 'border-red-500' : ''}`}
                    placeholder="1"
                    value={form.reviewTimeout / 3600}
                    onChange={(e) => setForm({ 
                      ...form, 
                      reviewTimeout: parseInt(e.target.value) * 3600 
                    })}
                  />
                  {errors.reviewTimeout && (
                    <p className="mt-1 text-sm text-red-600">{errors.reviewTimeout}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className="card">
              <div className="card-header">
                <h2 className="text-xl font-semibold text-gray-900 flex items-center">
                  <Upload className="h-5 w-5 mr-2" />
                  Metadata
                </h2>
              </div>
              <div className="card-body">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Metadata URI (optional)
                  </label>
                  <input
                    type="text"
                    className="input"
                    placeholder="ipfs://..."
                    value={form.metadataUri}
                    onChange={(e) => setForm({ ...form, metadataUri: e.target.value })}
                  />
                  <p className="mt-1 text-sm text-gray-500">
                    Leave empty to auto-generate metadata URI
                  </p>
                </div>
              </div>
            </div>

            {/* Submit */}
            <div className="flex justify-end gap-4">
              <button
                type="button"
                onClick={() => router.back()}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="btn btn-primary flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    Create Task
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
