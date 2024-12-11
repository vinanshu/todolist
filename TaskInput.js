import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import AsyncStorage from '@react-native-async-storage/async-storage';

const TaskInput = ({ onAddTask }) => {
  const [newTask, setNewTask] = useState('');

  // Load tasks from AsyncStorage when the component mounts
  const loadTasks = async () => {
    try {
      const tasks = await AsyncStorage.getItem('tasks');
      if (tasks) {
        const parsedTasks = JSON.parse(tasks);
        console.log('Loaded tasks from AsyncStorage:', parsedTasks);  // Log loaded tasks
        onAddTask(parsedTasks);  // Assuming onAddTask is used to set tasks in the parent component
      } else {
        console.log('No tasks found in AsyncStorage.');
      }
    } catch (error) {
      console.error('Failed to load tasks from AsyncStorage:', error);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  // Save tasks to AsyncStorage
  const saveTasks = async (tasks) => {
    try {
      await AsyncStorage.setItem('tasks', JSON.stringify(tasks));
      console.log('Tasks saved to AsyncStorage:', tasks);  // Log the tasks saved
    } catch (error) {
      console.error('Failed to save tasks to AsyncStorage:', error);
    }
  };

  const handleAddTask = () => {
    if (newTask.trim()) {
      const task = { id: Date.now(), text: newTask, completed: false };
      console.log('Adding new task:', task);  // Log new task being added
      onAddTask(task);  // Add task to parent state
      setNewTask('');
      
      // Retrieve existing tasks and save the new one
      AsyncStorage.getItem('tasks')
        .then((storedTasks) => {
          const tasks = storedTasks ? JSON.parse(storedTasks) : [];
          tasks.push(task);
          console.log('Updated tasks list:', tasks);  // Log the updated tasks list
          saveTasks(tasks);  // Save the updated tasks list
        })
        .catch((error) => console.error('Error adding task to storage:', error));
    } else {
      console.log('Task input is empty. Cannot add empty task.');
    }
  };

  return (
    <View style={styles.inputContainer}>
      <TextInput
        style={styles.input}
        placeholder="Add a new task"
        value={newTask}
        onChangeText={setNewTask}
      />
      <TouchableOpacity style={styles.addButton} onPress={handleAddTask}>
        <Icon name="add" size={24} color="white" />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ced4da',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#ffffff',
  },
  addButton: {
    backgroundColor: '#007bff',
    borderRadius: 8,
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
  },
});

export default TaskInput;