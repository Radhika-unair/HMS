import { useState, useEffect } from 'react';

const Collaboration = () => {
  const [currentDoctor, setCurrentDoctor] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [discussions, setDiscussions] = useState([]);
  const [selectedDiscussion, setSelectedDiscussion] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [showNewDiscussionModal, setShowNewDiscussionModal] = useState(false);
  const [newDiscussion, setNewDiscussion] = useState({
    title: '',
    description: '',
    patientId: '',
    participants: [],
    priority: 'normal',
  });

  useEffect(() => {
    // Load data from localStorage
    const doctor = JSON.parse(localStorage.getItem('currentDoctor'));
    const allDoctors = JSON.parse(localStorage.getItem('doctors') || '[]');
    const loadedDiscussions = JSON.parse(localStorage.getItem('caseDiscussions') || '[]');
    
    setCurrentDoctor(doctor);
    setDoctors(allDoctors.filter(d => d.id !== doctor.id));
    setDiscussions(loadedDiscussions);
  }, []);

  const handleNewDiscussion = () => {
    if (!newDiscussion.title || !newDiscussion.description) return;

    const discussion = {
      id: Date.now(),
      ...newDiscussion,
      createdBy: currentDoctor.id,
      createdAt: new Date().toISOString(),
      status: 'active',
      messages: [],
    };

    const updatedDiscussions = [...discussions, discussion];
    setDiscussions(updatedDiscussions);
    localStorage.setItem('caseDiscussions', JSON.stringify(updatedDiscussions));
    setShowNewDiscussionModal(false);
    setNewDiscussion({
      title: '',
      description: '',
      patientId: '',
      participants: [],
      priority: 'normal',
    });
  };

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedDiscussion) return;

    const message = {
      id: Date.now(),
      content: newMessage,
      senderId: currentDoctor.id,
      senderName: currentDoctor.name,
      timestamp: new Date().toISOString(),
    };

    const updatedDiscussions = discussions.map(disc =>
      disc.id === selectedDiscussion.id
        ? { ...disc, messages: [...disc.messages, message] }
        : disc
    );

    setDiscussions(updatedDiscussions);
    localStorage.setItem('caseDiscussions', JSON.stringify(updatedDiscussions));
    setNewMessage('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-800">Team Collaboration</h2>
        <button
          onClick={() => setShowNewDiscussionModal(true)}
          className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
        >
          New Discussion
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Discussions List */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h3 className="font-semibold text-gray-700">Case Discussions</h3>
          </div>
          <div className="divide-y max-h-[600px] overflow-y-auto">
            {discussions.map(discussion => (
              <button
                key={discussion.id}
                className={`w-full p-4 text-left hover:bg-gray-50 transition-colors ${
                  selectedDiscussion?.id === discussion.id ? 'bg-gray-50' : ''
                }`}
                onClick={() => setSelectedDiscussion(discussion)}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-gray-800">{discussion.title}</div>
                    <div className="text-sm text-gray-500">
                      {discussion.messages.length} messages
                    </div>
                  </div>
                  <span
                    className={`px-2 py-1 text-xs rounded-full ${
                      discussion.priority === 'high'
                        ? 'bg-red-100 text-red-800'
                        : discussion.priority === 'normal'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {discussion.priority}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Discussion Messages */}
        <div className="md:col-span-2">
          {selectedDiscussion ? (
            <div className="bg-white rounded-lg shadow h-full flex flex-col">
              <div className="p-4 border-b">
                <h3 className="font-semibold text-gray-700">{selectedDiscussion.title}</h3>
                <p className="text-sm text-gray-500 mt-1">{selectedDiscussion.description}</p>
              </div>
              
              <div className="flex-1 p-4 space-y-4 overflow-y-auto max-h-[500px]">
                {selectedDiscussion.messages.map(message => (
                  <div
                    key={message.id}
                    className={`flex ${
                      message.senderId === currentDoctor.id ? 'justify-end' : 'justify-start'
                    }`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg p-3 ${
                        message.senderId === currentDoctor.id
                          ? 'bg-primary text-white'
                          : 'bg-gray-100'
                      }`}
                    >
                      <div className="text-sm font-medium mb-1">
                        {message.senderId === currentDoctor.id ? 'You' : message.senderName}
                      </div>
                      <div>{message.content}</div>
                      <div className="text-xs mt-1 opacity-75">
                        {new Date(message.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 border-t">
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder="Type your message..."
                  />
                  <button
                    onClick={handleSendMessage}
                    className="px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-lg shadow p-6 text-center text-gray-500">
              Select a discussion to view messages
            </div>
          )}
        </div>
      </div>

      {/* New Discussion Modal */}
      {showNewDiscussionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 w-[500px]">
            <h3 className="text-lg font-semibold mb-4">Start New Discussion</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Title
                </label>
                <input
                  type="text"
                  value={newDiscussion.title}
                  onChange={(e) =>
                    setNewDiscussion({ ...newDiscussion, title: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  placeholder="Discussion title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newDiscussion.description}
                  onChange={(e) =>
                    setNewDiscussion({ ...newDiscussion, description: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                  rows="3"
                  placeholder="Describe the case or topic..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={newDiscussion.priority}
                  onChange={(e) =>
                    setNewDiscussion({ ...newDiscussion, priority: e.target.value })
                  }
                  className="w-full px-3 py-2 border rounded-md"
                >
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="low">Low</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Participants
                </label>
                <div className="space-y-2">
                  {doctors.map(doctor => (
                    <label key={doctor.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={newDiscussion.participants.includes(doctor.id)}
                        onChange={(e) => {
                          const participants = e.target.checked
                            ? [...newDiscussion.participants, doctor.id]
                            : newDiscussion.participants.filter(id => id !== doctor.id);
                          setNewDiscussion({ ...newDiscussion, participants });
                        }}
                        className="mr-2"
                      />
                      Dr. {doctor.name} - {doctor.specialty}
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex gap-4 mt-6">
                <button
                  onClick={handleNewDiscussion}
                  className="flex-1 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
                >
                  Create Discussion
                </button>
                <button
                  onClick={() => setShowNewDiscussionModal(false)}
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

export default Collaboration; 