'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { collection, query, where, getDocs, doc, updateDoc, deleteDoc, setDoc, arrayUnion } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Check, X, User, Users, BookOpen, Bell } from 'lucide-react';
import { motion } from 'framer-motion';
import { Timestamp } from 'firebase/firestore';

interface ConnectionRequest {
  id: string;
  teacherId?: string;
  teacherName?: string;
  teacherEmail?: string;
  parentId?: string;
  parentName?: string;
  parentEmail?: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  status: 'pending' | 'accepted' | 'rejected';
  createdAt: Timestamp;
  message?: string;
}

export default function StudentConnectionRequests() {
  const { user } = useAuth();
  const [pendingRequests, setPendingRequests] = useState<ConnectionRequest[]>([]);
  const [acceptedConnections, setAcceptedConnections] = useState<ConnectionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadConnectionRequests = useCallback(async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      setError('');
      
      // Load pending teacher connection requests
      const teacherRequestsQuery = query(
        collection(db, 'teacherConnections'),
        where('studentId', '==', user.uid),
        where('status', '==', 'pending')
      );
      
      let teacherSnapshot;
      try {
        teacherSnapshot = await getDocs(teacherRequestsQuery);
      } catch (error) {
        console.error('Error fetching teacher requests:', error);
        teacherSnapshot = { docs: [], size: 0 };
      }
      
      const teacherRequests = teacherSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ConnectionRequest[];

      // Load pending parent connection requests
      const parentRequestsQuery = query(
        collection(db, 'parentConnections'),
        where('studentId', '==', user.uid),
        where('status', '==', 'pending')
      );
      
      let parentSnapshot;
      try {
        parentSnapshot = await getDocs(parentRequestsQuery);
      } catch (error) {
        console.error('Error fetching parent requests:', error);
        parentSnapshot = { docs: [], size: 0 };
      }
      
      const parentRequests = parentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ConnectionRequest[];

      // Load accepted connections
      const acceptedTeacherQuery = query(
        collection(db, 'teacherConnections'),
        where('studentId', '==', user.uid),
        where('status', '==', 'accepted')
      );
      
      let acceptedTeacherSnapshot;
      try {
        acceptedTeacherSnapshot = await getDocs(acceptedTeacherQuery);
      } catch (error) {
        console.error('Error fetching accepted teacher connections:', error);
        acceptedTeacherSnapshot = { docs: [], size: 0 };
      }
      
      const acceptedTeacherConnections = acceptedTeacherSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ConnectionRequest[];

      const acceptedParentQuery = query(
        collection(db, 'parentConnections'),
        where('studentId', '==', user.uid),
        where('status', '==', 'accepted')
      );
      
      let acceptedParentSnapshot;
      try {
        acceptedParentSnapshot = await getDocs(acceptedParentQuery);
      } catch (error) {
        console.error('Error fetching accepted parent connections:', error);
        acceptedParentSnapshot = { docs: [], size: 0 };
      }
      
      const acceptedParentConnections = acceptedParentSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ConnectionRequest[];

      const allPending = [...teacherRequests, ...parentRequests];
      const allAccepted = [...acceptedTeacherConnections, ...acceptedParentConnections];
      
      setPendingRequests(allPending);
      setAcceptedConnections(allAccepted);
      
    } catch (error) {
      console.error('Error loading connection requests:', error);
      setError('Failed to load connection requests: ' + error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadConnectionRequests();
    }
  }, [user, loadConnectionRequests]);

  const acceptRequest = async (request: ConnectionRequest) => {
    try {
      console.log('Accepting request:', request);
      
      if (request.teacherId) {
        // Accept teacher connection
        console.log('Updating teacher connection status to accepted');
        await updateDoc(doc(db, 'teacherConnections', request.id), {
          status: 'accepted'
        });
        
        // Update student's teacherId
        console.log('Updating student teacherId to:', request.teacherId);
        await updateDoc(doc(db, 'users', user?.uid || ''), {
          teacherId: request.teacherId
        });
        
        // Update teacher's studentIds array
        console.log('Updating teacher studentIds array');
        const teacherRef = doc(db, 'users', request.teacherId);
        await updateDoc(teacherRef, {
          studentIds: arrayUnion(user?.uid || '')
        });
        
        console.log('Teacher connection accepted successfully');
      } else if (request.parentId) {
        // Accept parent connection
        console.log('Updating parent connection status to accepted');
        await updateDoc(doc(db, 'parentConnections', request.id), {
          status: 'accepted'
        });
        
        // Add parent to student's parentIds array
        console.log('Adding parent to student parentIds:', request.parentId);
        const studentRef = doc(db, 'users', user?.uid || '');
        await updateDoc(studentRef, {
          parentIds: arrayUnion(request.parentId)
        });
        
        // Update parent's childIds array
        console.log('Updating parent childIds array');
        const parentRef = doc(db, 'users', request.parentId);
        await updateDoc(parentRef, {
          childIds: arrayUnion(user?.uid || '')
        });
        
        console.log('Parent connection accepted successfully');
      }
      
      // Reload the requests
      console.log('Reloading connection requests...');
      await loadConnectionRequests();
      
      alert('Connection request accepted successfully!');
    } catch (error) {
      console.error('Error accepting request:', error);
      alert('Failed to accept connection request: ' + error);
    }
  };

  const rejectRequest = async (request: ConnectionRequest) => {
    try {
      if (request.teacherId) {
        await deleteDoc(doc(db, 'teacherConnections', request.id));
      } else if (request.parentId) {
        await deleteDoc(doc(db, 'parentConnections', request.id));
      }
      
      // Reload the requests
      loadConnectionRequests();
      
      alert('Connection request rejected.');
    } catch (error) {
      console.error('Error rejecting request:', error);
      alert('Failed to reject connection request. Please try again.');
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading connection requests...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Pending Connection Requests */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <Bell className="h-5 w-5 text-yellow-600" />
          <span>Pending Connection Requests</span>
        </h3>
        
        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {pendingRequests.length === 0 ? (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No pending connection requests</p>
            <p className="text-gray-400 text-sm mt-1">
              When teachers or parents send you connection requests, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pendingRequests.map((request) => (
              <motion.div
                key={request.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-yellow-50 border border-yellow-200 rounded-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {request.teacherId ? (
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      ) : (
                        <User className="h-4 w-4 text-green-600" />
                      )}
                      <span className="font-medium text-gray-900">
                        {request.teacherId ? 'Teacher Request' : 'Parent Request'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>{request.teacherName || request.parentName}</strong> 
                      ({request.teacherEmail || request.parentEmail})
                    </p>
                    
                    {request.message && (
                      <p className="text-sm text-gray-700 italic mb-3">
                        &ldquo;{request.message}&rdquo;
                      </p>
                    )}
                    
                    <p className="text-xs text-gray-500">
                      Requested on {request.createdAt instanceof Timestamp ? 
                        request.createdAt.toDate().toLocaleDateString() : 
                        'Unknown date'
                      }
                    </p>
                  </div>
                  
                  <div className="flex space-x-2 ml-4">
                    <button
                      onClick={() => acceptRequest(request)}
                      className="p-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors"
                      title="Accept connection"
                    >
                      <Check className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => rejectRequest(request)}
                      className="p-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                      title="Reject connection"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Accepted Connections */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
          <User className="h-5 w-5 text-green-600" />
          <span>Accepted Connections</span>
        </h3>
        
        {acceptedConnections.length === 0 ? (
          <div className="text-center py-8">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-500 text-lg">No accepted connections</p>
            <p className="text-gray-400 text-sm mt-1">
              Your accepted teacher and parent connections will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {acceptedConnections.map((connection) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-4 bg-green-50 border border-green-200 rounded-md"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {connection.teacherId ? (
                        <BookOpen className="h-4 w-4 text-blue-600" />
                      ) : (
                        <User className="h-4 w-4 text-green-600" />
                      )}
                      <span className="font-medium text-gray-900">
                        {connection.teacherId ? 'Teacher' : 'Parent'}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-1">
                      <strong>{connection.teacherName || connection.parentName}</strong> 
                      ({connection.teacherEmail || connection.parentEmail})
                    </p>
                    
                    <p className="text-xs text-gray-500">
                      Connected on {connection.createdAt instanceof Timestamp ? 
                        connection.createdAt.toDate().toLocaleDateString() : 
                        'Unknown date'
                      }
                    </p>
                  </div>
                  
                  <div className="flex items-center space-x-2 ml-4">
                    <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">
                      Connected
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
