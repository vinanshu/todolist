import React, { useState, useEffect } from 'react';
import { SafeAreaView, Text, FlatList, StyleSheet, ImageBackground } from 'react-native';
import TaskInput from './TaskInput';
import TaskItem from './TaskItem';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const [tasks, setTasks] = useState([]);

  // Load tasks from AsyncStorage when the app is first rendered
  const loadTasks = async () => {
    try {
      const storedTasks = await AsyncStorage.getItem('tasks');
      if (storedTasks) {
        setTasks(JSON.parse(storedTasks));
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
    } catch (error) {
      console.error('Failed to save tasks to AsyncStorage:', error);
    }
  };

  const addTask = (newTask) => {
    if (newTask.text.trim()) {
      let taskId;
  
      // Generate a random ID between 1 and 100, ensuring uniqueness
      do {
        taskId = Math.floor(Math.random() * 100) + 1;
      } while (tasks.some((task) => task.id === taskId)); // Check if ID already exists
      
      const currentDateTime = new Date();
      const newTaskObj = {
        id: taskId,
        text: newTask.text.trim(),
        completed: false,
        dateTime: currentDateTime.toLocaleString(),
        message: newTask.message || '',
      };
  
      // Use the functional form of setState to guarantee that the state update is based on the latest tasks state
      setTasks((prevTasks) => {
        const updatedTasks = [...prevTasks, newTaskObj];
        saveTasks(updatedTasks);
        return updatedTasks;
      });
    }
  };
  

  const toggleTaskCompletion = (taskId) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId ? { ...task, completed: !task.completed } : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };

  const deleteTask = (taskId) => {
    const updatedTasks = tasks.filter((task) => task.id !== taskId);
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  
    // Log the task ID to the console when it's deleted
    console.log(`Task with ID ${taskId} has been deleted`);
  };
  

  const editTask = (taskId, newText, newMessage) => {
    const updatedTasks = tasks.map((task) =>
      task.id === taskId
        ? { ...task, text: newText.trim(), message: newMessage.trim(), dateTime: new Date().toLocaleString() }
        : task
    );
    setTasks(updatedTasks);
    saveTasks(updatedTasks);
  };
  

  return (
    <ImageBackground
      source={require('./bg.webp')}
      style={styles.backgroundImage}
      resizeMode="cover"
    >
      <SafeAreaView style={styles.container}>
        <Text style={styles.title}>To-Do List</Text>
        <TaskInput onAddTask={addTask} />
        <FlatList
          data={tasks}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <TaskItem
              task={item}
              onToggleCompletion={() => toggleTaskCompletion(item.id)}
              onDelete={() => deleteTask(item.id)}
              onEditTask={editTask}
            />
          )}
          contentContainerStyle={styles.taskList}
        />
      </SafeAreaView>
    </ImageBackground>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333',
  },
  taskList: {
    paddingBottom: 20,
  },
  backgroundImage: {
    flex: 1,
  },
});

export default App;
