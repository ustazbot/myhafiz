'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useLanguage } from '@/hooks/useLanguage';
import { collection, query, where, getDocs, doc, updateDoc, addDoc, deleteDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { User, StudentConnection, TeacherConnection, ParentConnection } from '@/types';
import { UserPlus, UserCheck, UserX, Mail, Check, X, Users, Search, Plus, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { motion } from 'framer-motion';

// Interface for UI display of connections
interface UIConnection {
  id: string;
  studentId: string;
  studentName: string;
  studentEmail: string;
  connectedAt: Date;
  status: 'pending' | 'accepted' | 'rejected';
}

interface StudentConnectionsProps {
  userRole: 'Teacher' | 'Parent';
}

export default function StudentConnections({ userRole }: StudentConnectionsProps) {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [connections, setConnections] = useState<UIConnection[]>([]);
  const [pendingConnections, setPendingConnections] = useState<(StudentConnection | TeacherConnection | ParentConnection)[]>([]);
  const [loading, setLoading] = useState(true);
  const [newConnectionEmail, setNewConnectionEmail] = useState('');
  const [searchResults, setSearchResults] = useState<User[]>([]);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      loadConnections();
    }
  }, [user]);

  const loadConnections = async () => {
    try {
      setLoading(true);
      
      if (!user || !user.uid) return;
      
      if (userRole === 'Teacher') {
        // Load accepted students from teacher's studentIds array
        const teacherDoc = await getDoc(doc(db, 'users', user.uid));
        const teacherData = teacherDoc.data() as User;
        const studentIds = teacherData?.studentIds || [];
        
        // Also check for students with teacherId set to this teacher (legacy method)
        const legacyStudentsQuery = query(
          collection(db, 'users'),
          where('teacherId', '==', user.uid)
        );
        const legacyStudentsSnapshot = await getDocs(legacyStudentsQuery);
        const legacyStudents = legacyStudentsSnapshot.docs.map(doc => doc.data() as User);
        
        // Combine both methods
        let allStudentIds = new Set([...studentIds]);
        legacyStudents.forEach(student => allStudentIds.add(student.uid));
        
        let students: User[] = [];
        if (allStudentIds.size > 0) {
          // Get all students by their IDs
          const studentPromises = Array.from(allStudentIds).map(async (studentId) => {
            try {
              const studentDoc = await getDoc(doc(db, 'users', studentId));
              if (studentDoc.exists()) {
                return studentDoc.data() as User;
              }
              return null;
            } catch (error) {
              console.error('Error fetching student:', studentId, error);
              return null;
            }
          });
          
          const studentResults = await Promise.all(studentPromises);
          students = studentResults.filter(student => student !== null) as User[];
        }
        
        // Load pending connection requests
        const pendingQuery = query(
          collection(db, 'teacherConnections'),
          where('teacherId', '==', user.uid),
          where('status', '==', 'pending')
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        const pending = pendingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as TeacherConnection[];
        
        // Set accepted connections
        setConnections(students.map(student => ({
          id: student.uid,
          studentId: student.uid,
          studentName: student.name,
          studentEmail: student.email,
          connectedAt: student.createdAt,
          status: 'accepted'
        } as UIConnection)));
        
        // Set pending connections
        setPendingConnections(pending);
        
      } else if (userRole === 'Parent') {
        // Load accepted children from parent's childIds array
        const parentDoc = await getDoc(doc(db, 'users', user.uid));
        const parentData = parentDoc.data() as User;
        const childIds = parentData?.childIds || [];
        
        // Also check for children with parentIds containing this parent (legacy method)
        const legacyChildrenQuery = query(
          collection(db, 'users'),
          where('parentIds', 'array-contains', user.uid)
        );
        const legacyChildrenSnapshot = await getDocs(legacyChildrenQuery);
        const legacyChildren = legacyChildrenSnapshot.docs.map(doc => doc.data() as User);
        
        // Combine both methods
        let allChildIds = new Set([...childIds]);
        legacyChildren.forEach(child => allChildIds.add(child.uid));
        
        let children: User[] = [];
        if (allChildIds.size > 0) {
          // Get all children by their IDs
          const childPromises = Array.from(allChildIds).map(async (childId) => {
            try {
              const childDoc = await getDoc(doc(db, 'users', childId));
              if (childDoc.exists()) {
                return childDoc.data() as User;
              }
              return null;
            } catch (error) {
              console.error('Error fetching child:', childId, error);
              return null;
            }
          });
          
          const childResults = await Promise.all(childPromises);
          children = childResults.filter(child => child !== null) as User[];
        }
        
        // Load pending connection requests
        const pendingQuery = query(
          collection(db, 'parentConnections'),
          where('parentId', '==', user.uid),
          where('status', '==', 'pending')
        );
        const pendingSnapshot = await getDocs(pendingQuery);
        const pending = pendingSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as ParentConnection[];
        
        // Set accepted connections
        setConnections(children.map(child => ({
          id: child.uid,
          studentId: child.uid,
          studentName: child.name,
          studentEmail: child.email,
          connectedAt: child.createdAt,
          status: 'accepted'
        } as UIConnection)));
        
        // Set pending connections
        setPendingConnections(pending);
      }
    } catch (error) {
      console.error('Error loading connections:', error);
      setError('Failed to load connections: ' + error);
    } finally {
      setLoading(false);
    }
  };

  const searchStudents = async (email: string) => {
    if (!email.trim()) return;
    
    try {
      setSearching(true);
      setError('');
      
      // First, try to get the user document directly by email
      const usersQuery = query(
        collection(db, 'users'),
        where('email', '==', email.trim().toLowerCase())
      );
      
      const snapshot = await getDocs(usersQuery);
      const results = snapshot.docs
        .map(doc => ({ ...doc.data(), uid: doc.id } as User))
        .filter(user => user.role === 'Student');
      
      setSearchResults(results);
      
      if (results.length === 0) {
        console.log('No students found with email:', email.trim());
      }
    } catch (error) {
      console.error('Error searching students:', error);
      setError('Failed to search for students. Please check your connection and try again.');
      
      // Fallback: try to get all users and filter client-side (less secure but more reliable)
      try {
        console.log('Trying fallback search method...');
        const allUsersQuery = query(collection(db, 'users'));
        const fallbackSnapshot = await getDocs(allUsersQuery);
        const allUsers = fallbackSnapshot.docs
          .map(doc => ({ ...doc.data(), uid: doc.id } as User))
          .filter(user => 
            user.role === 'Student' && 
            user.email.toLowerCase().includes(email.trim().toLowerCase())
          );
        
        setSearchResults(allUsers);
        console.log('Fallback search found:', allUsers.length, 'students');
      } catch (fallbackError) {
        console.error('Fallback search also failed:', fallbackError);
        setError('Unable to search for students. Please try again later.');
      }
    } finally {
      setSearching(false);
    }
  };

  const sendConnectionRequest = async (student: User) => {
    if (!user) return;

    try {
      if (userRole === 'Teacher') {
        // Send teacher connection request
        await addDoc(collection(db, 'teacherConnections'), {
          teacherId: user.uid,
          teacherName: user.name,
          teacherEmail: user.email,
          studentId: student.uid,
          studentName: student.name,
          studentEmail: student.email,
          status: 'pending',
          createdAt: new Date(),
          message: `${user.name} wants to connect with you as your teacher.`
        });
      } else if (userRole === 'Parent') {
        // Send parent connection request
        await addDoc(collection(db, 'parentConnections'), {
          parentId: user.uid,
          parentName: user.name,
          parentEmail: user.email,
          studentId: student.uid,
          studentName: student.name,
          studentEmail: student.email,
          status: 'pending',
          createdAt: new Date(),
          message: `${user.name} wants to connect with you as your parent.`
        });
      }
      
      // Clear the search
      setNewConnectionEmail('');
      setSearchResults([]);
      
      // Reload connections to show the new pending request
      loadConnections();
      
      // Show success message
      alert(`Connection request sent to ${student.name}! They will need to accept the request.`);
    } catch (error) {
      console.error('Error sending connection request:', error);
      alert('Failed to send connection request. Please try again.');
    }
  };

  const acceptConnection = async (connection: StudentConnection | TeacherConnection | ParentConnection) => {
    try {
      if (userRole === 'Teacher' && 'studentId' in connection) {
        // Accept teacher connection
        await updateDoc(doc(db, 'teacherConnections', connection.id), {
          status: 'accepted'
        });
        
        // Update student's teacherId
        await updateDoc(doc(db, 'users', connection.studentId), {
          teacherId: user?.uid
        });
      } else if (userRole === 'Parent' && 'studentId' in connection) {
        // Accept parent connection
        await updateDoc(doc(db, 'parentConnections', connection.id), {
          status: 'accepted'
        });
        
        // Add parent to student's parentIds array
        const studentRef = doc(db, 'users', connection.studentId);
        await updateDoc(studentRef, {
          parentIds: [user?.uid]
        });
      }
      
      loadConnections();
    } catch (error) {
      console.error('Error accepting connection:', error);
    }
  };

  const rejectConnection = async (connection: StudentConnection | TeacherConnection | ParentConnection) => {
    try {
      if (userRole === 'Teacher') {
        await deleteDoc(doc(db, 'teacherConnections', connection.id));
      } else if (userRole === 'Parent') {
        await deleteDoc(doc(db, 'parentConnections', connection.id));
      }
      
      loadConnections();
    } catch (error) {
      console.error('Error rejecting connection:', error);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl p-4 mx-auto mb-4 animate-pulse">
          <Users className="h-8 w-8 text-white" />
        </div>
        <p className="text-lg text-surface-600 dark:text-surface-400 font-medium">Loading connections...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Enhanced Header */}
      <div className="card-elevated p-8 bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border-blue-200 dark:border-blue-700">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl p-3 shadow-glow">
            <Users className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              {userRole === 'Teacher' ? 'Student Connections' : 'Child Connections'}
            </h3>
            <p className="text-surface-600 dark:text-surface-400">
              {userRole === 'Teacher' 
                ? 'Manage your student connections and track their progress.'
                : 'Monitor your children\'s Quran memorization progress.'
              }
            </p>
          </div>
        </div>
        
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 text-red-700 dark:text-red-300 rounded-xl flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 flex-shrink-0" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
        
        {/* Enhanced Search Form */}
        <div className="bg-white/60 dark:bg-surface-800/60 backdrop-blur-sm rounded-2xl p-6 border border-white/20 dark:border-surface-700/20">
          <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-surface-400" />
              <input
                type="email"
                placeholder="Enter student email address"
                value={newConnectionEmail}
                onChange={(e) => setNewConnectionEmail(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white dark:bg-surface-800 border border-surface-300 dark:border-surface-600 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 dark:focus:border-blue-400 text-surface-900 dark:text-surface-100 placeholder-surface-500 dark:placeholder-surface-400 transition-all duration-200"
              />
            </div>
            <button
              onClick={() => searchStudents(newConnectionEmail)}
              disabled={searching || !newConnectionEmail.trim()}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed min-w-[120px]"
            >
              {searching ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Searching...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </div>
              )}
            </button>
          </div>
        </div>
        
        {/* Enhanced Search Results */}
        {searchResults.length > 0 && (
          <div className="card p-6">
            <div className="flex items-center space-x-2 mb-4">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <p className="text-sm font-medium text-surface-700 dark:text-surface-300">
                Found {searchResults.length} student(s):
              </p>
            </div>
            <div className="space-y-3">
              {searchResults.map((student) => (
                <motion.div
                  key={student.uid}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-4 bg-gradient-to-r from-surface-50 to-surface-100 dark:from-surface-800 dark:to-surface-700 rounded-xl border border-surface-200 dark:border-surface-600 hover:shadow-md transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {student.name.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-surface-900 dark:text-surface-100 text-lg">{student.name}</p>
                      <p className="text-surface-600 dark:text-surface-400">{student.email}</p>
                      <span className="badge badge-secondary text-xs">{student.role}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => sendConnectionRequest(student)}
                    className="btn-primary hover:scale-105 transition-transform duration-200"
                  >
                    <UserPlus className="h-4 w-4 mr-2" />
                    Connect
                  </button>
                </motion.div>
              ))}
            </div>
          </div>
        )}
        
        {searchResults.length === 0 && newConnectionEmail.trim() && !searching && (
          <div className="card p-6 bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-700">
            <div className="flex items-center space-x-3">
              <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
              <p className="text-sm text-yellow-800 dark:text-yellow-200">
                No student found with that email address. Make sure the student has already registered an account.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Enhanced Pending Connections */}
      {pendingConnections.length > 0 && (
        <div className="card-elevated p-8">
          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl p-2">
              <Clock className="h-6 w-6 text-white" />
            </div>
            <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100">Pending Connections</h3>
            <span className="badge badge-warning">{pendingConnections.length}</span>
          </div>
          <div className="space-y-4">
            {pendingConnections.map((connection) => {
              // Extract display information based on connection type
              let displayName = '';
              let displayEmail = '';
              
              if ('studentId' in connection) {
                displayName = connection.studentName;
                displayEmail = connection.studentEmail;
              } else if ('teacherId' in connection) {
                displayName = (connection as TeacherConnection).teacherName;
                displayEmail = (connection as TeacherConnection).teacherEmail;
              } else if ('parentId' in connection) {
                displayName = (connection as ParentConnection).parentName;
                displayEmail = (connection as ParentConnection).parentEmail;
              }
              
              return (
                <motion.div
                  key={connection.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-900/20 dark:to-orange-900/20 border border-yellow-200 dark:border-yellow-700 rounded-2xl hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-yellow-500 to-orange-500 rounded-xl flex items-center justify-center">
                      <span className="text-white text-lg font-bold">
                        {displayName.charAt(0).toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-surface-900 dark:text-surface-100 text-lg">{displayName}</p>
                      <p className="text-surface-600 dark:text-surface-400">{displayEmail}</p>
                      <span className="badge badge-warning text-xs">Pending approval</span>
                    </div>
                  </div>
                  <div className="flex space-x-3">
                    <button
                      onClick={() => acceptConnection(connection)}
                      className="w-12 h-12 bg-green-500 hover:bg-green-600 text-white rounded-xl hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-glow hover:shadow-glow-lg"
                      title="Accept connection"
                    >
                      <Check className="h-5 w-5" />
                    </button>
                    <button
                      onClick={() => rejectConnection(connection)}
                      className="w-12 h-12 bg-red-500 hover:bg-red-600 text-white rounded-xl hover:scale-105 transition-all duration-200 flex items-center justify-center shadow-glow hover:shadow-glow-lg"
                      title="Reject connection"
                    >
                      <X className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      )}

      {/* Enhanced Current Connections */}
      <div className="card-elevated p-8">
        <div className="flex items-center space-x-3 mb-6">
          <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl p-2">
            <UserCheck className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-bold text-surface-900 dark:text-surface-100">
            {userRole === 'Teacher' ? 'My Students' : 'My Children'}
          </h3>
          <span className="badge badge-success">{connections.length}</span>
        </div>
        
        {connections.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 bg-gradient-to-br from-surface-200 to-surface-300 dark:from-surface-700 dark:to-surface-600 rounded-2xl p-5 mx-auto mb-4">
              <Users className="h-10 w-10 text-surface-400 dark:text-surface-500" />
            </div>
            <p className="text-xl text-surface-500 dark:text-surface-400 font-medium mb-2">
              No {userRole === 'Teacher' ? 'students' : 'children'} connected yet.
            </p>
            <p className="text-surface-400 dark:text-surface-500">
              Use the form above to search for and connect with {userRole === 'Teacher' ? 'students' : 'children'}.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {connections.map((connection) => (
              <motion.div
                key={connection.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border border-green-200 dark:border-green-700 rounded-2xl hover:shadow-lg transition-all duration-200"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl flex items-center justify-center">
                    <span className="text-white text-lg font-bold">
                      {connection.studentName.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="font-semibold text-surface-900 dark:text-surface-100 text-lg">{connection.studentName}</p>
                    <p className="text-surface-600 dark:text-surface-400">{connection.studentEmail}</p>
                    <span className="badge badge-success text-xs">Connected</span>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <UserCheck className="h-6 w-6 text-green-500" />
                  <span className="text-sm text-green-600 dark:text-green-400 font-medium">Connected</span>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
