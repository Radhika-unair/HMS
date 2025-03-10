import { useState, useEffect } from 'react';

const DocumentManagement = () => {
  const [documents, setDocuments] = useState([]);
  const [patients, setPatients] = useState([]);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [newDocument, setNewDocument] = useState({
    title: '',
    type: '',
    description: '',
    file: null,
    sharedWith: [],
  });

  const DOCUMENT_TYPES = [
    'Medical Report',
    'Lab Result',
    'Prescription',
    'Imaging',
    'Consent Form',
    'Referral Letter',
    'Progress Note',
    'Discharge Summary',
  ];

  useEffect(() => {
    // Load patients and documents from localStorage
    const loadedPatients = JSON.parse(localStorage.getItem('patients') || '[]');
    const loadedDocuments = JSON.parse(localStorage.getItem('medicalDocuments') || '[]');
    setPatients(loadedPatients);
    setDocuments(loadedDocuments);
  }, []);

  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.id.toString().includes(searchTerm)
  );

  const patientDocuments = documents.filter(
    doc => doc.patientId === selectedPatient?.id
  );

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // In a real app, you would handle file upload to a server
      // Here we'll just store the file name
      setNewDocument({ ...newDocument, file: file.name });
    }
  };

  const handleUpload = () => {
    if (!selectedPatient || !newDocument.title || !newDocument.type) return;

    const document = {
      id: Date.now(),
      patientId: selectedPatient.id,
      patientName: selectedPatient.name,
      doctorId: JSON.parse(localStorage.getItem('currentDoctor')).id,
      doctorName: JSON.parse(localStorage.getItem('currentDoctor')).name,
      ...newDocument,
      uploadDate: new Date().toISOString(),
      status: 'active',
    };

    const updatedDocuments = [...documents, document];
    setDocuments(updatedDocuments);
    localStorage.setItem('medicalDocuments', JSON.stringify(updatedDocuments));
    setShowUploadModal(false);
    setNewDocument({
      title: '',
      type: '',
      description: '',
      file: null,
      sharedWith: [],
    });
  };

  const handleShare = (documentId, recipientId) => {
    const updatedDocuments = documents.map(doc =>
      doc.id === documentId
        ? { ...doc, sharedWith: [...doc.sharedWith, recipientId] }
        : doc
    );
    setDocuments(updatedDocuments);
    localStorage.setItem('medicalDocuments', JSON.stringify(updatedDocuments));
  };

  const handleDelete = (documentId) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      const updatedDocuments = documents.filter(doc => doc.id !== documentId);
      setDocuments(updatedDocuments);
      localStorage.setItem('medicalDocuments', JSON.stringify(updatedDocuments));
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Document Management</h2>
        <div className="w-64">
          <input
            type="text"
            placeholder="Search patients..."
            className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Patient List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-700">Select Patient</h3>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {filteredPatients.map(patient => (
              <button
                key={patient.id}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedPatient?.id === patient.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => setSelectedPatient(patient)}
              >
                <div className="font-medium text-gray-800">{patient.name}</div>
                <div className="text-sm text-gray-500">ID: {patient.id}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Documents List */}
        <div className="md:col-span-2">
          <div className="bg-white rounded-lg shadow">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold text-gray-700">
                {selectedPatient ? `${selectedPatient.name}'s Documents` : 'Select a patient'}
              </h3>
              {selectedPatient && (
                <button
                  onClick={() => setShowUploadModal(true)}
                  className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Upload Document
                </button>
              )}
            </div>
            <div className="p-4">
              {!selectedPatient ? (
                <p className="text-center text-gray-500">Select a patient to view documents</p>
              ) : patientDocuments.length === 0 ? (
                <p className="text-center text-gray-500">No documents found</p>
              ) : (
                <div className="space-y-4">
                  {patientDocuments.map(document => (
                    <div
                      key={document.id}
                      className="border rounded-lg p-4"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">{document.title}</h4>
                          <p className="text-sm text-gray-500">
                            Type: {document.type}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleShare(document.id, selectedPatient.id)}
                            className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded hover:bg-blue-200"
                          >
                            Share
                          </button>
                          <button
                            onClick={() => handleDelete(document.id)}
                            className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded hover:bg-red-200"
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                      {document.description && (
                        <p className="text-sm text-gray-600 mt-2">
                          {document.description}
                        </p>
                      )}
                      <div className="flex justify-between items-center mt-2 text-sm text-gray-500">
                        <span>Uploaded on {new Date(document.uploadDate).toLocaleDateString()}</span>
                        <span>By Dr. {document.doctorName}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newDocument.title}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Document title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <select
                  value={newDocument.type}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, type: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="">Select type</option>
                  {DOCUMENT_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newDocument.description}
                  onChange={(e) =>
                    setNewDocument({ ...newDocument, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                  placeholder="Document description..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  File
                </label>
                <input
                  type="file"
                  onChange={handleFileChange}
                  className="w-full"
                />
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleUpload}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Upload
                </button>
                <button
                  onClick={() => setShowUploadModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DocumentManagement; 