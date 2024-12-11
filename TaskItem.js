import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  TextInput,
  Button,
  StyleSheet,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskItem = ({ task, onToggleCompletion, onDelete, onEditTask }) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [editedText, setEditedText] = useState(task.text);
  const [message, setMessage] = useState(task.message || ''); // Added state for message

  // Load task message from AsyncStorage when the component is loaded
  const loadTask = async () => {
    try {
      console.log('Loading task from AsyncStorage...'); // Log loading task process
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        const tasks = JSON.parse(storedTasks);
        const taskToEdit = tasks.find(t => t.id === task.id);
        if (taskToEdit) {
          setEditedText(taskToEdit.text);
          setMessage(taskToEdit.message || '');
          console.log('Task loaded from AsyncStorage:', taskToEdit); // Log the loaded task
        }
      }
    } catch (error) {
      console.error('Failed to load task from AsyncStorage:', error);
    }
  };

  useEffect(() => {
    loadTask();
  }, []);

  // Save tasks to AsyncStorage
  const saveTasks = async (tasks) => {
    try {
      console.log('Saving tasks to AsyncStorage:', tasks); // Log the tasks being saved
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
    } catch (error) {
      console.error('Failed to save tasks to AsyncStorage:', error);
    }
  };

  const handleEdit = () => {
    if (editedText.trim()) {
      console.log('Saving edited task:', { id: task.id, text: editedText, message }); // Log edited task data
      onEditTask(task.id, editedText, message); // Pass edited text and message to parent for updating

      // Retrieve existing tasks and save the updated task
      AsyncStorage.getItem('tasks')
        .then((storedTasks) => {
          const tasks = storedTasks ? JSON.parse(storedTasks) : [];
          const updatedTasks = tasks.map(t => 
            t.id === task.id ? { ...t, text: editedText, message } : t
          );
          console.log('Updated tasks list:', updatedTasks); // Log updated task list
          saveTasks(updatedTasks); // Save the updated task list
        })
        .catch((error) => console.error('Error editing task in storage:', error));

      setModalVisible(false); // Close modal
    } else {
      console.log('No text entered for editing task.'); // Log if no text was entered
    }
  };

  return (
    <>
      <View style={styles.taskContainer}>
        <TouchableOpacity
          style={styles.taskTextContainer}
          onPress={() => setModalVisible(true)} // Open modal when text container is clicked
        >
          <Text style={[styles.taskText, task.completed && styles.taskCompleted]}>
            {task.text}
          </Text>
          <Text style={styles.taskDateTime}>{task.dateTime}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => onDelete(task.id)}>
          <Icon name="delete" size={24} color="red" />
        </TouchableOpacity>
      </View>

      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <ScrollView contentContainerStyle={styles.scrollViewContent}>
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Edit Task</Text>
              <TextInput
                style={styles.modalInput}
                value={editedText}
                onChangeText={setEditedText}
                multiline={true}
                numberOfLines={4}
                placeholder="Edit task text"
              />
              <TextInput
                style={styles.modalInput}
                value={message}
                onChangeText={setMessage} // Set the message state
                multiline={true}
                numberOfLines={4}
                placeholder="Add a message (optional)"
              />
              <View style={styles.modalButtons}>
                <Button title="Cancel" onPress={() => setModalVisible(false)} color="gray" />
                <Button title="Save" onPress={handleEdit} color="blue" />
              </View>
            </View>
          </ScrollView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  taskContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#dee2e6',
    backgroundColor: '#ffffff',
    borderRadius: 8,
    marginBottom: 10,
  },
  taskTextContainer: {
    flex: 1,
  },
  taskText: {
    fontSize: 16,
  },
  taskCompleted: {
    textDecorationLine: 'line-through',
    color: '#6c757d',
  },
  taskDateTime: {
    fontSize: 12,
    color: '#6c757d',
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
  },
  scrollViewContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '90%',
    padding: 20,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 10,
    marginBottom: 20,
    backgroundColor: '#f8f9fa',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});

export default TaskItem;