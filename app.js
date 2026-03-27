// ==================== FIREBASE INITIALIZATION ====================

let db, auth, currentUser;

function initFirebase() {
    try {
        firebase.initializeApp(firebaseConfig);
        db = firebase.firestore();
        auth = firebase.auth();

        // Enable offline persistence
        db.enablePersistence().catch(err => {
            console.log('Persistence error:', err.code);
        });

        // Listen for auth state changes
        auth.onAuthStateChanged(user => {
            if (user) {
                currentUser = user;
                showApp();
            } else {
                currentUser = null;
                showAuthScreen();
            }
        });
    } catch (error) {
        console.error('Firebase init error:', error);
        showAuthError('Firebase configuration error. Check config.js');
    }
}

// ==================== AUTHENTICATION ====================

let isSignUp = false;

function showAuthScreen() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('app').classList.add('hidden');
    document.getElementById('auth-form').classList.remove('hidden');
    document.getElementById('auth-loading').classList.add('hidden');
}

function showApp() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('user-email').textContent = currentUser.email;
    initApp();
}

function toggleAuthMode() {
    isSignUp = !isSignUp;
    document.getElementById('auth-submit').textContent = isSignUp ? 'Sign Up' : 'Sign In';
    document.getElementById('auth-switch-text').textContent = isSignUp ? 'Already have an account?' : "Don't have an account?";
    document.getElementById('auth-switch-btn').textContent = isSignUp ? 'Sign In' : 'Sign Up';
    hideAuthError();
}

function showAuthError(message) {
    const errorEl = document.getElementById('auth-error');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
}

function hideAuthError() {
    document.getElementById('auth-error').classList.add('hidden');
}

async function handleAuth() {
    const email = document.getElementById('auth-email').value.trim();
    const password = document.getElementById('auth-password').value;

    if (!email || !password) {
        showAuthError('Please enter email and password');
        return;
    }

    if (password.length < 6) {
        showAuthError('Password must be at least 6 characters');
        return;
    }

    hideAuthError();
    document.getElementById('auth-form').classList.add('hidden');
    document.getElementById('auth-loading').classList.remove('hidden');

    try {
        if (isSignUp) {
            await auth.createUserWithEmailAndPassword(email, password);
            // Initialize default exercises for new user
            await initializeDefaultExercises();
        } else {
            await auth.signInWithEmailAndPassword(email, password);
        }
    } catch (error) {
        document.getElementById('auth-form').classList.remove('hidden');
        document.getElementById('auth-loading').classList.add('hidden');

        let message = 'An error occurred';
        switch (error.code) {
            case 'auth/email-already-in-use':
                message = 'Email already in use';
                break;
            case 'auth/invalid-email':
                message = 'Invalid email address';
                break;
            case 'auth/user-not-found':
            case 'auth/wrong-password':
            case 'auth/invalid-credential':
                message = 'Invalid email or password';
                break;
            case 'auth/weak-password':
                message = 'Password is too weak';
                break;
            default:
                message = error.message;
        }
        showAuthError(message);
    }
}

async function signOut() {
    if (confirm('Sign out?')) {
        await auth.signOut();
    }
}

// ==================== DEFAULT EXERCISES ====================

const DEFAULT_EXERCISES = [
    { id: 'squat', name: 'Barbell Squat', category: 'compound', muscle: 'quads' },
    { id: 'bench', name: 'Bench Press', category: 'compound', muscle: 'chest' },
    { id: 'deadlift', name: 'Deadlift', category: 'compound', muscle: 'back' },
    { id: 'ohp', name: 'Overhead Press', category: 'compound', muscle: 'shoulders' },
    { id: 'row', name: 'Barbell Row', category: 'compound', muscle: 'back' },
    { id: 'incline-bench', name: 'Incline Bench Press', category: 'compound', muscle: 'chest' },
    { id: 'db-bench', name: 'Dumbbell Bench Press', category: 'compound', muscle: 'chest' },
    { id: 'cable-fly', name: 'Cable Fly', category: 'isolation', muscle: 'chest' },
    { id: 'pec-deck', name: 'Pec Deck', category: 'isolation', muscle: 'chest' },
    { id: 'pullup', name: 'Pull-up', category: 'compound', muscle: 'back' },
    { id: 'lat-pulldown', name: 'Lat Pulldown', category: 'compound', muscle: 'back' },
    { id: 'cable-row', name: 'Seated Cable Row', category: 'compound', muscle: 'back' },
    { id: 'db-row', name: 'Dumbbell Row', category: 'compound', muscle: 'back' },
    { id: 'db-ohp', name: 'Dumbbell Shoulder Press', category: 'compound', muscle: 'shoulders' },
    { id: 'lateral-raise', name: 'Lateral Raise', category: 'isolation', muscle: 'shoulders' },
    { id: 'rear-delt-fly', name: 'Rear Delt Fly', category: 'isolation', muscle: 'shoulders' },
    { id: 'face-pull', name: 'Face Pull', category: 'isolation', muscle: 'shoulders' },
    { id: 'barbell-curl', name: 'Barbell Curl', category: 'isolation', muscle: 'biceps' },
    { id: 'db-curl', name: 'Dumbbell Curl', category: 'isolation', muscle: 'biceps' },
    { id: 'hammer-curl', name: 'Hammer Curl', category: 'isolation', muscle: 'biceps' },
    { id: 'tricep-pushdown', name: 'Tricep Pushdown', category: 'isolation', muscle: 'triceps' },
    { id: 'skull-crusher', name: 'Skull Crusher', category: 'isolation', muscle: 'triceps' },
    { id: 'overhead-ext', name: 'Overhead Tricep Extension', category: 'isolation', muscle: 'triceps' },
    { id: 'front-squat', name: 'Front Squat', category: 'compound', muscle: 'quads' },
    { id: 'leg-press', name: 'Leg Press', category: 'compound', muscle: 'quads' },
    { id: 'leg-ext', name: 'Leg Extension', category: 'isolation', muscle: 'quads' },
    { id: 'rdl', name: 'Romanian Deadlift', category: 'compound', muscle: 'hamstrings' },
    { id: 'leg-curl', name: 'Leg Curl', category: 'isolation', muscle: 'hamstrings' },
    { id: 'hip-thrust', name: 'Hip Thrust', category: 'compound', muscle: 'glutes' },
    { id: 'calf-raise', name: 'Calf Raise', category: 'isolation', muscle: 'calves' },
    { id: 'plank', name: 'Plank', category: 'isolation', muscle: 'core' },
    { id: 'cable-crunch', name: 'Cable Crunch', category: 'isolation', muscle: 'core' },
    { id: 'hanging-leg-raise', name: 'Hanging Leg Raise', category: 'isolation', muscle: 'core' }
];

async function initializeDefaultExercises() {
    const batch = db.batch();
    const exercisesRef = db.collection('users').doc(currentUser.uid).collection('exercises');

    for (const exercise of DEFAULT_EXERCISES) {
        batch.set(exercisesRef.doc(exercise.id), exercise);
    }

    await batch.commit();
}

// ==================== DATA ACCESS (FIREBASE) ====================

// Cache for exercises
let exercisesCache = null;
let exercisesListener = null;

async function getExercises() {
    if (exercisesCache) return exercisesCache;

    const snapshot = await db.collection('users').doc(currentUser.uid)
        .collection('exercises').get();

    if (snapshot.empty) {
        await initializeDefaultExercises();
        exercisesCache = [...DEFAULT_EXERCISES];
    } else {
        exercisesCache = snapshot.docs.map(doc => doc.data());
    }

    exercisesCache.sort((a, b) => a.name.localeCompare(b.name));

    return exercisesCache;
}

function subscribeToExercises(callback) {
    if (exercisesListener) exercisesListener();

    exercisesListener = db.collection('users').doc(currentUser.uid)
        .collection('exercises')
        .onSnapshot(snapshot => {
            exercisesCache = snapshot.docs.map(doc => doc.data());
            callback(exercisesCache);
        });
}

async function addExercise(exercise) {
    await db.collection('users').doc(currentUser.uid)
        .collection('exercises').doc(exercise.id).set(exercise);
    exercisesCache = null;
}

async function getWorkouts() {
    const snapshot = await db.collection('users').doc(currentUser.uid)
        .collection('workouts').orderBy('createdAt', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function saveWorkoutTemplate(workout) {
    if (workout.id) {
        await db.collection('users').doc(currentUser.uid)
            .collection('workouts').doc(workout.id).set(workout);
    } else {
        const docRef = await db.collection('users').doc(currentUser.uid)
            .collection('workouts').add(workout);
        workout.id = docRef.id;
    }
    return workout;
}

async function deleteWorkoutTemplate(workoutId) {
    await db.collection('users').doc(currentUser.uid)
        .collection('workouts').doc(workoutId).delete();
}

async function getSessions() {
    const snapshot = await db.collection('users').doc(currentUser.uid)
        .collection('sessions').orderBy('date', 'desc').get();
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

async function saveSession(session) {
    if (session.id) {
        await db.collection('users').doc(currentUser.uid)
            .collection('sessions').doc(session.id).set(session);
    } else {
        const docRef = await db.collection('users').doc(currentUser.uid)
            .collection('sessions').add(session);
        session.id = docRef.id;
    }
    return session;
}

async function getPRs() {
    const snapshot = await db.collection('users').doc(currentUser.uid)
        .collection('prs').get();
    const prs = {};
    snapshot.docs.forEach(doc => {
        prs[doc.id] = doc.data().records || [];
    });
    return prs;
}

async function savePRs(exerciseId, records) {
    await db.collection('users').doc(currentUser.uid)
        .collection('prs').doc(exerciseId).set({ records });
}

async function getActiveWorkout() {
    const doc = await db.collection('users').doc(currentUser.uid)
        .collection('state').doc('activeWorkout').get();
    return doc.exists ? doc.data() : null;
}

async function saveActiveWorkout(workout) {
    await db.collection('users').doc(currentUser.uid)
        .collection('state').doc('activeWorkout').set(workout);
}

async function clearActiveWorkout() {
    await db.collection('users').doc(currentUser.uid)
        .collection('state').doc('activeWorkout').delete();
}

// ==================== STATE ====================

let currentView = 'dashboard';
let editingWorkout = null;
let currentWorkoutExercises = [];
let editingExerciseIndex = null;
let editingSets = [];
let workoutStartTime = null;
let workoutTimerInterval = null;

// Past session state
let pastSessionExercises = [];
let pastEditingExerciseIndex = null;
let pastEditingSets = [];

// ==================== NAVIGATION ====================

function initNavigation() {
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const view = item.dataset.view;
            navigateTo(view);
        });
    });
}

function navigateTo(view) {
    currentView = view;

    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.toggle('active', item.dataset.view === view);
    });

    document.querySelectorAll('.view').forEach(v => {
        v.classList.remove('active');
    });
    document.getElementById(`${view}-view`).classList.add('active');

    const titles = {
        dashboard: 'Dashboard',
        plan: 'Workout Plans',
        workout: 'Workout',
        progress: 'Progress',
        prs: 'Personal Records',
        exercises: 'Exercises',
        settings: 'Settings'
    };
    document.getElementById('page-title').textContent = titles[view] || view;

    const headerAction = document.getElementById('header-action');
    if (view === 'plan') {
        headerAction.classList.remove('hidden');
        headerAction.onclick = () => openWorkoutEditor();
    } else {
        headerAction.classList.add('hidden');
    }

    refreshView(view);
}

async function refreshView(view) {
    switch(view) {
        case 'dashboard':
            await renderDashboard();
            break;
        case 'plan':
            await renderWorkoutTemplates();
            break;
        case 'workout':
            await renderActiveWorkout();
            break;
        case 'progress':
            await populateProgressExercises();
            break;
        case 'prs':
            await renderAllPRs();
            break;
        case 'exercises':
            await renderExercisesList();
            break;
    }
}

// ==================== DASHBOARD ====================

async function renderDashboard() {
    const [sessions, prs, workouts] = await Promise.all([
        getSessions(),
        getPRs(),
        getWorkouts()
    ]);

    document.getElementById('total-workouts').textContent = sessions.length;

    const totalVolume = sessions.reduce((sum, session) => {
        return sum + (session.exercises || []).reduce((exSum, ex) => {
            return exSum + (ex.sets || []).reduce((setSum, set) => {
                if (set.completed) {
                    return setSum + (set.weight * set.reps);
                }
                return setSum;
            }, 0);
        }, 0);
    }, 0);
    document.getElementById('total-volume').textContent = formatNumber(totalVolume);

    const prCount = Object.values(prs).reduce((sum, exPrs) => sum + exPrs.length, 0);
    document.getElementById('total-prs').textContent = prCount;

    // Recent PRs
    const recentPRsContainer = document.getElementById('recent-prs');
    const allPRsList = [];
    Object.entries(prs).forEach(([exerciseId, exPrs]) => {
        exPrs.forEach(pr => {
            allPRsList.push({ exerciseId, ...pr });
        });
    });
    allPRsList.sort((a, b) => new Date(b.date) - new Date(a.date));

    if (allPRsList.length === 0) {
        recentPRsContainer.innerHTML = '<p class="empty-state">No PRs yet. Start lifting!</p>';
    } else {
        const exercises = await getExercises();
        recentPRsContainer.innerHTML = allPRsList.slice(0, 3).map(pr => {
            const exercise = exercises.find(e => e.id === pr.exerciseId);
            return `
                <div class="pr-card">
                    <span class="exercise-name">${exercise?.name || pr.exerciseId}</span>
                    <div class="pr-details">
                        <span class="pr-value">${pr.weight} lbs x ${pr.reps}</span>
                        <span class="pr-date">${formatDate(pr.date)}</span>
                    </div>
                </div>
            `;
        }).join('');
    }

    // Planned workouts
    const plannedContainer = document.getElementById('planned-workouts');
    const upcomingWorkouts = workouts.filter(w => w.scheduledDate && new Date(w.scheduledDate) >= new Date().setHours(0,0,0,0));
    upcomingWorkouts.sort((a, b) => new Date(a.scheduledDate) - new Date(b.scheduledDate));

    if (upcomingWorkouts.length === 0) {
        plannedContainer.innerHTML = '<p class="empty-state">No workouts planned. Create one!</p>';
    } else {
        const exercises = await getExercises();
        plannedContainer.innerHTML = upcomingWorkouts.slice(0, 3).map(workout => {
            const exerciseNames = (workout.exercises || []).slice(0, 3).map(e => {
                const ex = exercises.find(ex => ex.id === e.exerciseId);
                return ex?.name || e.exerciseId;
            }).join(', ');
            return `
                <div class="workout-card" onclick="startWorkout('${workout.id}')">
                    <div class="workout-card-header">
                        <h3>${workout.name}</h3>
                        <span class="date">${formatDate(workout.scheduledDate)}</span>
                    </div>
                    <p class="exercises-preview">${exerciseNames}${(workout.exercises || []).length > 3 ? '...' : ''}</p>
                </div>
            `;
        }).join('');
    }

    // Recent sessions
    const sessionsContainer = document.getElementById('recent-sessions');
    if (sessions.length === 0) {
        sessionsContainer.innerHTML = '<p class="empty-state">No sessions logged yet.</p>';
    } else {
        const exercises = await getExercises();
        const recentSessions = sessions.slice(0, 5);
        sessionsContainer.innerHTML = recentSessions.map(session => {
            const exerciseNames = (session.exercises || []).slice(0, 3).map(e => {
                const ex = exercises.find(ex => ex.id === e.exerciseId);
                return ex?.name || e.exerciseId;
            }).join(', ');
            const volume = (session.exercises || []).reduce((sum, ex) => {
                return sum + (ex.sets || []).reduce((setSum, set) => {
                    if (set.completed) return setSum + ((set.weight || 0) * (set.reps || 0));
                    return setSum;
                }, 0);
            }, 0);
            return `
                <div class="session-card">
                    <div class="session-card-header">
                        <h3>${session.name}</h3>
                        <span class="date">${formatDate(session.date)}</span>
                    </div>
                    <p class="exercises-preview">${exerciseNames} - ${formatNumber(volume)} lbs</p>
                </div>
            `;
        }).join('');
    }
}

// ==================== WORKOUT PLANNING ====================

async function renderWorkoutTemplates() {
    const workouts = await getWorkouts();
    const container = document.getElementById('workout-templates');
    const exercises = await getExercises();

    if (workouts.length === 0) {
        container.innerHTML = '<p class="empty-state">No workout templates. Tap + to create one!</p>';
        return;
    }

    container.innerHTML = workouts.map(workout => {
        const exerciseNames = (workout.exercises || []).slice(0, 3).map(e => {
            const ex = exercises.find(ex => ex.id === e.exerciseId);
            return ex?.name || e.exerciseId;
        }).join(', ');
        return `
            <div class="workout-card">
                <div class="workout-card-header">
                    <h3>${workout.name}</h3>
                    ${workout.scheduledDate ? `<span class="date">${formatDate(workout.scheduledDate)}</span>` : ''}
                </div>
                <p class="exercises-preview">${exerciseNames}${(workout.exercises || []).length > 3 ? '...' : ''}</p>
                <div class="workout-card-actions">
                    <button class="start-btn" onclick="event.stopPropagation(); startWorkout('${workout.id}')">Start</button>
                    <button class="edit-btn" onclick="event.stopPropagation(); openWorkoutEditor('${workout.id}')">Edit</button>
                    <button class="delete-btn" onclick="event.stopPropagation(); deleteWorkout('${workout.id}')">Delete</button>
                </div>
            </div>
        `;
    }).join('');
}

async function openWorkoutEditor(workoutId = null) {
    const modal = document.getElementById('workout-editor');
    modal.classList.add('active');

    if (workoutId) {
        const workouts = await getWorkouts();
        editingWorkout = workouts.find(w => w.id === workoutId);
        document.getElementById('editor-title').textContent = 'Edit Workout';
        document.getElementById('workout-name').value = editingWorkout.name;
        document.getElementById('workout-date').value = editingWorkout.scheduledDate || '';
        currentWorkoutExercises = JSON.parse(JSON.stringify(editingWorkout.exercises || []));
    } else {
        editingWorkout = null;
        document.getElementById('editor-title').textContent = 'New Workout';
        document.getElementById('workout-name').value = '';
        document.getElementById('workout-date').value = '';
        currentWorkoutExercises = [];
    }

    await renderWorkoutExercises();
}

function closeWorkoutEditor() {
    document.getElementById('workout-editor').classList.remove('active');
    editingWorkout = null;
    currentWorkoutExercises = [];
}

async function renderWorkoutExercises() {
    const container = document.getElementById('workout-exercises');
    const exercises = await getExercises();

    if (currentWorkoutExercises.length === 0) {
        container.innerHTML = '<p class="empty-state">No exercises added yet.</p>';
        return;
    }

    container.innerHTML = currentWorkoutExercises.map((we, index) => {
        const exercise = exercises.find(e => e.id === we.exerciseId);
        const setsInfo = (we.sets || []).map(s => `${s.targetReps}x${s.targetWeight}lbs`).join(', ');
        return `
            <div class="exercise-item" onclick="openSetEditor(${index})">
                <div class="exercise-item-header">
                    <div>
                        <span class="name">${exercise?.name || we.exerciseId}</span>
                        <span class="muscle">${exercise?.muscle || ''}</span>
                    </div>
                    <button class="remove-btn" onclick="event.stopPropagation(); removeExerciseFromWorkout(${index})">x</button>
                </div>
                <div class="sets-info">${(we.sets || []).length} sets: ${setsInfo}</div>
            </div>
        `;
    }).join('');
}

async function showExercisePicker() {
    document.getElementById('exercise-picker').classList.add('active');
    document.getElementById('exercise-search').value = '';
    await renderExerciseOptions();
}

function closeExercisePicker() {
    document.getElementById('exercise-picker').classList.remove('active');
}

async function renderExerciseOptions(filter = '') {
    const exercises = await getExercises();
    const container = document.getElementById('exercise-options');

    const filtered = exercises.filter(e =>
        e.name.toLowerCase().includes(filter.toLowerCase()) ||
        e.muscle.toLowerCase().includes(filter.toLowerCase())
    );

    container.innerHTML = filtered.map(exercise => `
        <div class="exercise-item" onclick="addExerciseToWorkout('${exercise.id}')">
            <div class="exercise-item-header">
                <div>
                    <span class="name">${exercise.name}</span>
                    <span class="muscle">${exercise.muscle}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function filterExercises() {
    const filter = document.getElementById('exercise-search').value;
    renderExerciseOptions(filter);
}

function addExerciseToWorkout(exerciseId) {
    currentWorkoutExercises.push({
        exerciseId,
        sets: [
            { targetReps: 8, targetWeight: 0 },
            { targetReps: 8, targetWeight: 0 },
            { targetReps: 8, targetWeight: 0 }
        ]
    });
    closeExercisePicker();
    renderWorkoutExercises();
}

function removeExerciseFromWorkout(index) {
    currentWorkoutExercises.splice(index, 1);
    renderWorkoutExercises();
}

async function openSetEditor(exerciseIndex) {
    editingExerciseIndex = exerciseIndex;
    editingSets = JSON.parse(JSON.stringify(currentWorkoutExercises[exerciseIndex].sets || []));

    const exercises = await getExercises();
    const exercise = exercises.find(e => e.id === currentWorkoutExercises[exerciseIndex].exerciseId);

    document.getElementById('set-editor-title').textContent = exercise?.name || 'Edit Sets';
    document.getElementById('set-editor').classList.add('active');

    renderSetEditor();
}

function closeSetEditor() {
    document.getElementById('set-editor').classList.remove('active');
    editingExerciseIndex = null;
    editingSets = [];
}

function renderSetEditor() {
    const container = document.getElementById('sets-container');

    container.innerHTML = `
        <div class="set-labels">
            <span>Set</span>
            <span>Reps</span>
            <span>Weight (lbs)</span>
            <span></span>
        </div>
    ` + editingSets.map((set, index) => `
        <div class="set-row">
            <span class="set-number">${index + 1}</span>
            <input type="number" value="${set.targetReps}" onchange="updateSetValue(${index}, 'targetReps', this.value)" placeholder="Reps">
            <input type="number" value="${set.targetWeight}" onchange="updateSetValue(${index}, 'targetWeight', this.value)" placeholder="Weight">
            <button class="remove-set-btn" onclick="removeSet(${index})">x</button>
        </div>
    `).join('');
}

function updateSetValue(index, field, value) {
    editingSets[index][field] = parseInt(value) || 0;
}

function addSetToEditor() {
    const lastSet = editingSets[editingSets.length - 1] || { targetReps: 8, targetWeight: 0 };
    editingSets.push({ targetReps: lastSet.targetReps, targetWeight: lastSet.targetWeight });
    renderSetEditor();
}

function removeSet(index) {
    editingSets.splice(index, 1);
    renderSetEditor();
}

function saveSets() {
    if (editingExerciseIndex !== null && editingSets.length > 0) {
        currentWorkoutExercises[editingExerciseIndex].sets = editingSets;
        renderWorkoutExercises();
    }
    closeSetEditor();
}

async function saveWorkout() {
    const name = document.getElementById('workout-name').value.trim();
    const scheduledDate = document.getElementById('workout-date').value;

    if (!name) {
        showToast('Please enter a workout name', 'error');
        return;
    }

    if (currentWorkoutExercises.length === 0) {
        showToast('Please add at least one exercise', 'error');
        return;
    }

    const workout = {
        name,
        scheduledDate,
        exercises: currentWorkoutExercises,
        createdAt: editingWorkout?.createdAt || new Date().toISOString()
    };

    if (editingWorkout) {
        workout.id = editingWorkout.id;
    }

    await saveWorkoutTemplate(workout);
    closeWorkoutEditor();
    await renderWorkoutTemplates();
    showToast('Workout saved!', 'success');
}

async function deleteWorkout(workoutId) {
    if (!confirm('Delete this workout template?')) return;

    await deleteWorkoutTemplate(workoutId);
    await renderWorkoutTemplates();
    showToast('Workout deleted', 'success');
}

// ==================== NEW EXERCISE ====================

function openNewExerciseForm() {
    document.getElementById('new-exercise-form').classList.add('active');
    document.getElementById('new-exercise-name').value = '';
}

function closeNewExerciseForm() {
    document.getElementById('new-exercise-form').classList.remove('active');
}

async function saveNewExercise() {
    const name = document.getElementById('new-exercise-name').value.trim();
    const category = document.getElementById('new-exercise-category').value;
    const muscle = document.getElementById('new-exercise-muscle').value;

    if (!name) {
        showToast('Please enter an exercise name', 'error');
        return;
    }

    const exercises = await getExercises();
    const id = name.toLowerCase().replace(/\s+/g, '-');

    if (exercises.find(e => e.id === id)) {
        showToast('Exercise already exists', 'error');
        return;
    }

    await addExercise({ id, name, category, muscle });

    closeNewExerciseForm();
    await renderExerciseOptions();
    showToast('Exercise added!', 'success');
}

// ==================== ACTIVE WORKOUT ====================

async function renderActiveWorkout() {
    const active = await getActiveWorkout();

    if (!active) {
        document.getElementById('no-active-workout').classList.remove('hidden');
        document.getElementById('active-workout').classList.add('hidden');
        stopWorkoutTimer();
        return;
    }

    document.getElementById('no-active-workout').classList.add('hidden');
    document.getElementById('active-workout').classList.remove('hidden');
    document.getElementById('active-workout-name').textContent = active.name;

    workoutStartTime = new Date(active.startTime);
    startWorkoutTimer();

    await renderActiveExercises(active);
}

async function renderActiveExercises(active) {
    const container = document.getElementById('active-exercises');
    const exercises = await getExercises();

    container.innerHTML = (active.exercises || []).map((we, exIndex) => {
        const exercise = exercises.find(e => e.id === we.exerciseId);

        return `
            <div class="exercise-log-card">
                <h3>
                    ${exercise?.name || we.exerciseId}
                    <button class="remove-exercise-btn" onclick="removeExerciseFromActive(${exIndex})">Remove</button>
                </h3>
                <div class="log-sets-list">
                    ${(we.sets || []).map((set, setIndex) => `
                        ${set.targetReps ? `
                            <div class="log-set-row target-info">
                                <span></span>
                                <span>Target: ${set.targetReps} reps</span>
                                <span>@ ${set.targetWeight || '?'} lbs</span>
                                <span></span>
                            </div>
                        ` : ''}
                        <div class="log-set-row">
                            <span class="set-number">${setIndex + 1}</span>
                            <input type="number"
                                   value="${set.reps || ''}"
                                   placeholder="${set.targetReps || 'Reps'}"
                                   onchange="updateActiveSet(${exIndex}, ${setIndex}, 'reps', this.value)">
                            <input type="number"
                                   value="${set.weight || ''}"
                                   placeholder="${set.targetWeight || 'lbs'}"
                                   onchange="updateActiveSet(${exIndex}, ${setIndex}, 'weight', this.value)">
                            <button class="complete-btn ${set.completed ? 'completed' : ''}"
                                    onclick="toggleSetComplete(${exIndex}, ${setIndex})">
                                ${set.completed ? '✓' : '○'}
                            </button>
                        </div>
                    `).join('')}
                </div>
                <button class="add-set-btn" onclick="addSetToActive(${exIndex})">+ Add Set</button>
            </div>
        `;
    }).join('');
}

async function showQuickStartOptions() {
    document.getElementById('quick-start-modal').classList.add('active');

    const workouts = await getWorkouts();
    const container = document.getElementById('quick-start-templates');
    const exercises = await getExercises();

    if (workouts.length === 0) {
        container.innerHTML = '<p class="empty-state">No templates available</p>';
    } else {
        container.innerHTML = workouts.map(workout => {
            const exerciseNames = (workout.exercises || []).slice(0, 2).map(e => {
                const ex = exercises.find(ex => ex.id === e.exerciseId);
                return ex?.name || e.exerciseId;
            }).join(', ');
            return `
                <div class="workout-card" onclick="startWorkout('${workout.id}'); closeQuickStart();">
                    <h3>${workout.name}</h3>
                    <p class="exercises-preview">${exerciseNames}</p>
                </div>
            `;
        }).join('');
    }
}

function closeQuickStart() {
    document.getElementById('quick-start-modal').classList.remove('active');
}

async function startWorkout(workoutId) {
    const workouts = await getWorkouts();
    const workout = workouts.find(w => w.id === workoutId);

    if (!workout) {
        showToast('Workout not found', 'error');
        return;
    }

    const activeWorkout = {
        workoutId: workout.id,
        name: workout.name,
        startTime: new Date().toISOString(),
        exercises: (workout.exercises || []).map(e => ({
            exerciseId: e.exerciseId,
            sets: (e.sets || []).map(s => ({
                targetReps: s.targetReps,
                targetWeight: s.targetWeight,
                reps: null,
                weight: s.targetWeight || null,
                completed: false
            }))
        }))
    };

    await saveActiveWorkout(activeWorkout);
    closeQuickStart();
    navigateTo('workout');
}

async function startEmptyWorkout() {
    const activeWorkout = {
        workoutId: null,
        name: 'Quick Workout',
        startTime: new Date().toISOString(),
        exercises: []
    };

    await saveActiveWorkout(activeWorkout);
    closeQuickStart();
    navigateTo('workout');
}

async function addExerciseToActive() {
    document.getElementById('exercise-picker').classList.add('active');
    document.getElementById('exercise-search').value = '';

    const exercises = await getExercises();
    const container = document.getElementById('exercise-options');

    container.innerHTML = exercises.map(exercise => `
        <div class="exercise-item" onclick="addExerciseToActiveWorkout('${exercise.id}')">
            <div class="exercise-item-header">
                <div>
                    <span class="name">${exercise.name}</span>
                    <span class="muscle">${exercise.muscle}</span>
                </div>
            </div>
        </div>
    `).join('');
}

async function addExerciseToActiveWorkout(exerciseId) {
    const active = await getActiveWorkout();
    active.exercises.push({
        exerciseId,
        sets: [
            { reps: null, weight: null, completed: false },
            { reps: null, weight: null, completed: false },
            { reps: null, weight: null, completed: false }
        ]
    });
    await saveActiveWorkout(active);
    closeExercisePicker();
    await renderActiveExercises(active);
}

async function removeExerciseFromActive(exerciseIndex) {
    if (!confirm('Remove this exercise?')) return;

    const active = await getActiveWorkout();
    active.exercises.splice(exerciseIndex, 1);
    await saveActiveWorkout(active);
    await renderActiveExercises(active);
}

async function updateActiveSet(exerciseIndex, setIndex, field, value) {
    const active = await getActiveWorkout();
    active.exercises[exerciseIndex].sets[setIndex][field] = parseFloat(value) || null;
    await saveActiveWorkout(active);
}

async function toggleSetComplete(exerciseIndex, setIndex) {
    const active = await getActiveWorkout();
    const set = active.exercises[exerciseIndex].sets[setIndex];
    set.completed = !set.completed;

    if (set.completed) {
        if (!set.reps && set.targetReps) set.reps = set.targetReps;
        if (!set.weight && set.targetWeight) set.weight = set.targetWeight;
    }

    await saveActiveWorkout(active);
    await renderActiveExercises(active);
}

async function addSetToActive(exerciseIndex) {
    const active = await getActiveWorkout();
    const lastSet = active.exercises[exerciseIndex].sets.slice(-1)[0] || {};
    active.exercises[exerciseIndex].sets.push({
        reps: null,
        weight: lastSet.weight || null,
        completed: false
    });
    await saveActiveWorkout(active);
    await renderActiveExercises(active);
}

function startWorkoutTimer() {
    if (workoutTimerInterval) return;

    workoutTimerInterval = setInterval(() => {
        const elapsed = Date.now() - workoutStartTime.getTime();
        document.getElementById('workout-duration').textContent = formatDuration(elapsed);
    }, 1000);
}

function stopWorkoutTimer() {
    if (workoutTimerInterval) {
        clearInterval(workoutTimerInterval);
        workoutTimerInterval = null;
    }
}

async function finishWorkout() {
    const active = await getActiveWorkout();

    if (!active) return;

    const completedSets = (active.exercises || []).reduce((sum, ex) =>
        sum + (ex.sets || []).filter(s => s.completed).length, 0);

    if (completedSets === 0) {
        if (!confirm('No sets completed. Finish anyway?')) return;
    }

    const session = {
        workoutId: active.workoutId,
        name: active.name,
        date: active.startTime,
        duration: Date.now() - new Date(active.startTime).getTime(),
        exercises: (active.exercises || []).map(ex => ({
            exerciseId: ex.exerciseId,
            sets: (ex.sets || []).filter(s => s.completed).map(s => ({
                reps: s.reps,
                weight: s.weight,
                completed: true
            }))
        })).filter(ex => ex.sets.length > 0)
    };

    await saveSession(session);
    await checkAndUpdatePRs(session);
    await clearActiveWorkout();
    stopWorkoutTimer();

    showToast('Workout complete!', 'success');
    navigateTo('dashboard');
}

async function cancelWorkout() {
    if (!confirm('Cancel this workout? All progress will be lost.')) return;

    await clearActiveWorkout();
    stopWorkoutTimer();
    navigateTo('dashboard');
}

async function checkAndUpdatePRs(session, silent = false) {
    const prs = await getPRs();
    let newPRs = 0;

    for (const exercise of (session.exercises || [])) {
        if (!prs[exercise.exerciseId]) {
            prs[exercise.exerciseId] = [];
        }

        for (const set of (exercise.sets || [])) {
            if (!set.weight || !set.reps) continue;

            const existingPR = prs[exercise.exerciseId].find(pr => pr.reps === set.reps);

            if (!existingPR || set.weight > existingPR.weight) {
                prs[exercise.exerciseId] = prs[exercise.exerciseId].filter(pr => pr.reps !== set.reps);
                prs[exercise.exerciseId].push({
                    weight: set.weight,
                    reps: set.reps,
                    date: session.date
                });
                newPRs++;
            }
        }

        if (prs[exercise.exerciseId].length > 0) {
            await savePRs(exercise.exerciseId, prs[exercise.exerciseId]);
        }
    }

    if (newPRs > 0 && !silent) {
        showToast(`${newPRs} new PR${newPRs > 1 ? 's' : ''} set!`, 'success');
    }

    return newPRs;
}

// ==================== PAST SESSION LOGGING ====================

function openPastSessionForm() {
    document.getElementById('past-session-form').classList.add('active');
    document.getElementById('past-session-name').value = '';
    document.getElementById('past-session-date').value = new Date().toISOString().split('T')[0];
    document.getElementById('past-session-hours').value = '';
    document.getElementById('past-session-minutes').value = '';
    pastSessionExercises = [];
    renderPastSessionExercises();
}

function closePastSessionForm() {
    document.getElementById('past-session-form').classList.remove('active');
    pastSessionExercises = [];
}

async function renderPastSessionExercises() {
    const container = document.getElementById('past-session-exercises');
    const exercises = await getExercises();

    if (pastSessionExercises.length === 0) {
        container.innerHTML = '<p class="empty-state">No exercises added yet.</p>';
        return;
    }

    container.innerHTML = pastSessionExercises.map((pe, index) => {
        const exercise = exercises.find(e => e.id === pe.exerciseId);
        const setsInfo = pe.sets.map(s => `${s.reps}x${s.weight}lbs`).join(', ');
        return `
            <div class="exercise-item" onclick="openPastSetEditor(${index})">
                <div class="exercise-item-header">
                    <div>
                        <span class="name">${exercise?.name || pe.exerciseId}</span>
                        <span class="muscle">${exercise?.muscle || ''}</span>
                    </div>
                    <button class="remove-btn" onclick="event.stopPropagation(); removePastExercise(${index})">x</button>
                </div>
                <div class="sets-info">${pe.sets.length} sets: ${setsInfo}</div>
            </div>
        `;
    }).join('');
}

async function showPastSessionExercisePicker() {
    document.getElementById('exercise-picker').classList.add('active');
    document.getElementById('exercise-search').value = '';

    const exercises = await getExercises();
    const container = document.getElementById('exercise-options');

    container.innerHTML = exercises.map(exercise => `
        <div class="exercise-item" onclick="addExerciseToPastSession('${exercise.id}')">
            <div class="exercise-item-header">
                <div>
                    <span class="name">${exercise.name}</span>
                    <span class="muscle">${exercise.muscle}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function addExerciseToPastSession(exerciseId) {
    pastSessionExercises.push({
        exerciseId,
        sets: [{ reps: 0, weight: 0 }]
    });
    closeExercisePicker();
    renderPastSessionExercises();
    openPastSetEditor(pastSessionExercises.length - 1);
}

function removePastExercise(index) {
    pastSessionExercises.splice(index, 1);
    renderPastSessionExercises();
}

async function openPastSetEditor(exerciseIndex) {
    pastEditingExerciseIndex = exerciseIndex;
    pastEditingSets = JSON.parse(JSON.stringify(pastSessionExercises[exerciseIndex].sets));

    const exercises = await getExercises();
    const exercise = exercises.find(e => e.id === pastSessionExercises[exerciseIndex].exerciseId);

    document.getElementById('past-set-editor-title').textContent = exercise?.name || 'Edit Sets';
    document.getElementById('past-set-editor').classList.add('active');

    renderPastSetEditor();
}

function closePastSetEditor() {
    document.getElementById('past-set-editor').classList.remove('active');
    pastEditingExerciseIndex = null;
    pastEditingSets = [];
}

function renderPastSetEditor() {
    const container = document.getElementById('past-sets-container');

    container.innerHTML = pastEditingSets.map((set, index) => `
        <div class="set-row">
            <span class="set-number">${index + 1}</span>
            <input type="number" value="${set.reps || ''}"
                   onchange="updatePastSetValue(${index}, 'reps', this.value)"
                   placeholder="Reps" inputmode="numeric">
            <input type="number" value="${set.weight || ''}"
                   onchange="updatePastSetValue(${index}, 'weight', this.value)"
                   placeholder="Weight" inputmode="decimal">
            <button class="remove-set-btn" onclick="removePastSet(${index})">x</button>
        </div>
    `).join('');
}

function updatePastSetValue(index, field, value) {
    pastEditingSets[index][field] = parseFloat(value) || 0;
}

function addPastSet() {
    const lastSet = pastEditingSets[pastEditingSets.length - 1] || { reps: 0, weight: 0 };
    pastEditingSets.push({ reps: lastSet.reps, weight: lastSet.weight });
    renderPastSetEditor();
}

function removePastSet(index) {
    if (pastEditingSets.length <= 1) {
        showToast('Need at least one set', 'error');
        return;
    }
    pastEditingSets.splice(index, 1);
    renderPastSetEditor();
}

function savePastSets() {
    if (pastEditingExerciseIndex !== null) {
        const validSets = pastEditingSets.filter(s => s.reps > 0 || s.weight > 0);
        if (validSets.length === 0) {
            showToast('Add at least one set with data', 'error');
            return;
        }
        pastSessionExercises[pastEditingExerciseIndex].sets = validSets;
        renderPastSessionExercises();
    }
    closePastSetEditor();
}

async function savePastSession() {
    const name = document.getElementById('past-session-name').value.trim();
    const date = document.getElementById('past-session-date').value;
    const hours = parseInt(document.getElementById('past-session-hours').value) || 0;
    const minutes = parseInt(document.getElementById('past-session-minutes').value) || 0;

    if (!name) {
        showToast('Please enter a workout name', 'error');
        return;
    }

    if (!date) {
        showToast('Please select a date', 'error');
        return;
    }

    if (pastSessionExercises.length === 0) {
        showToast('Please add at least one exercise', 'error');
        return;
    }

    const validExercises = pastSessionExercises.filter(ex =>
        ex.sets.some(s => s.reps > 0 && s.weight > 0)
    );

    if (validExercises.length === 0) {
        showToast('Please add reps and weight to at least one set', 'error');
        return;
    }

    const session = {
        workoutId: null,
        name,
        date: new Date(date).toISOString(),
        duration: (hours * 3600 + minutes * 60) * 1000,
        exercises: validExercises.map(ex => ({
            exerciseId: ex.exerciseId,
            sets: ex.sets.filter(s => s.reps > 0 && s.weight > 0).map(s => ({
                reps: s.reps,
                weight: s.weight,
                completed: true
            }))
        }))
    };

    await saveSession(session);
    const newPRs = await checkAndUpdatePRs(session, true);

    closePastSessionForm();

    if (newPRs > 0) {
        showToast(`Session saved with ${newPRs} PR${newPRs > 1 ? 's' : ''}!`, 'success');
    } else {
        showToast('Past session saved!', 'success');
    }

    navigateTo('dashboard');
}

// ==================== PROGRESS ====================

async function populateProgressExercises() {
    const exercises = await getExercises();
    const sessions = await getSessions();
    const select = document.getElementById('progress-exercise');

    const exercisesWithData = new Set();
    sessions.forEach(session => {
        (session.exercises || []).forEach(ex => {
            if (ex.sets.length > 0) {
                exercisesWithData.add(ex.exerciseId);
            }
        });
    });

    select.innerHTML = '<option value="">-- Select Exercise --</option>' +
        exercises
            .filter(e => exercisesWithData.has(e.id))
            .map(e => `<option value="${e.id}">${e.name}</option>`)
            .join('');
}

async function updateProgressChart() {
    const exerciseId = document.getElementById('progress-exercise').value;
    const canvas = document.getElementById('progress-chart');
    const ctx = canvas.getContext('2d');
    const statsContainer = document.getElementById('progress-stats');

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (!exerciseId) {
        statsContainer.classList.add('hidden');
        return;
    }

    const sessions = await getSessions();
    const dataPoints = [];

    sessions.forEach(session => {
        const exercise = (session.exercises || []).find(e => e.exerciseId === exerciseId);
        if (exercise && exercise.sets.length > 0) {
            const maxWeight = Math.max(...exercise.sets.map(s => s.weight || 0));
            const totalVolume = exercise.sets.reduce((sum, s) => sum + ((s.weight || 0) * (s.reps || 0)), 0);
            dataPoints.push({
                date: new Date(session.date),
                maxWeight,
                totalVolume,
                sets: exercise.sets.length
            });
        }
    });

    dataPoints.sort((a, b) => a.date - b.date);

    if (dataPoints.length === 0) {
        statsContainer.classList.add('hidden');
        return;
    }

    drawProgressChart(canvas, ctx, dataPoints);

    statsContainer.classList.remove('hidden');
    document.getElementById('best-weight').textContent = Math.max(...dataPoints.map(d => d.maxWeight)) + ' lbs';
    document.getElementById('best-volume').textContent = formatNumber(Math.max(...dataPoints.map(d => d.totalVolume))) + ' lbs';
    document.getElementById('total-sets').textContent = dataPoints.reduce((sum, d) => sum + d.sets, 0);
}

function drawProgressChart(canvas, ctx, dataPoints) {
    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width;
    canvas.height = rect.height;

    const padding = { top: 30, right: 20, bottom: 40, left: 50 };
    const width = canvas.width - padding.left - padding.right;
    const height = canvas.height - padding.top - padding.bottom;

    const maxWeight = Math.max(...dataPoints.map(d => d.maxWeight));
    const minWeight = Math.min(...dataPoints.map(d => d.maxWeight));
    const range = maxWeight - minWeight || maxWeight;
    const yScale = height / (range * 1.2);
    const yOffset = minWeight - (range * 0.1);

    const lineColor = '#6c5ce7';
    const pointColor = '#a29bfe';
    const gridColor = '#2d2d4a';
    const textColor = '#6c6c8a';

    ctx.strokeStyle = gridColor;
    ctx.lineWidth = 1;
    for (let i = 0; i <= 4; i++) {
        const y = padding.top + (height / 4) * i;
        ctx.beginPath();
        ctx.moveTo(padding.left, y);
        ctx.lineTo(canvas.width - padding.right, y);
        ctx.stroke();

        const value = Math.round(maxWeight - (range * 1.2 / 4) * i + (range * 0.1));
        ctx.fillStyle = textColor;
        ctx.font = '11px -apple-system, sans-serif';
        ctx.textAlign = 'right';
        ctx.fillText(value + '', padding.left - 8, y + 4);
    }

    ctx.beginPath();
    ctx.strokeStyle = lineColor;
    ctx.lineWidth = 2;

    dataPoints.forEach((point, i) => {
        const x = padding.left + (width / (dataPoints.length - 1 || 1)) * i;
        const y = padding.top + height - ((point.maxWeight - yOffset) * yScale);

        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    ctx.stroke();

    dataPoints.forEach((point, i) => {
        const x = padding.left + (width / (dataPoints.length - 1 || 1)) * i;
        const y = padding.top + height - ((point.maxWeight - yOffset) * yScale);

        ctx.beginPath();
        ctx.fillStyle = pointColor;
        ctx.arc(x, y, 5, 0, Math.PI * 2);
        ctx.fill();

        if (dataPoints.length <= 7 || i % Math.ceil(dataPoints.length / 7) === 0) {
            ctx.fillStyle = textColor;
            ctx.font = '10px -apple-system, sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText(formatShortDate(point.date), x, canvas.height - 10);
        }
    });

    ctx.fillStyle = '#b2b2c8';
    ctx.font = '12px -apple-system, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillText('Max Weight Over Time', padding.left, 16);
}

// ==================== PRs VIEW ====================

async function renderAllPRs(filter = 'all') {
    const prs = await getPRs();
    const exercises = await getExercises();
    const container = document.getElementById('all-prs');

    let allPRs = [];
    Object.entries(prs).forEach(([exerciseId, exPrs]) => {
        const exercise = exercises.find(e => e.id === exerciseId);
        if (filter !== 'all' && exercise?.category !== filter) return;

        exPrs.forEach(pr => {
            allPRs.push({
                exerciseId,
                exerciseName: exercise?.name || exerciseId,
                muscle: exercise?.muscle || '',
                ...pr
            });
        });
    });

    allPRs.sort((a, b) => {
        const dateCompare = new Date(b.date) - new Date(a.date);
        if (dateCompare !== 0) return dateCompare;
        return a.exerciseName.localeCompare(b.exerciseName);
    });

    if (allPRs.length === 0) {
        container.innerHTML = '<p class="empty-state">No PRs recorded yet.</p>';
        return;
    }

    const grouped = {};
    allPRs.forEach(pr => {
        if (!grouped[pr.exerciseId]) {
            grouped[pr.exerciseId] = {
                name: pr.exerciseName,
                muscle: pr.muscle,
                prs: []
            };
        }
        grouped[pr.exerciseId].prs.push(pr);
    });

    container.innerHTML = Object.entries(grouped).map(([id, data]) => {
        const bestPR = data.prs.reduce((best, pr) => pr.weight > best.weight ? pr : best);
        return `
            <div class="pr-card">
                <div>
                    <span class="exercise-name">${data.name}</span>
                    <span class="muscle" style="display: block; font-size: 0.8rem; color: var(--text-muted);">${data.muscle}</span>
                </div>
                <div class="pr-details">
                    <span class="pr-value">${bestPR.weight} lbs x ${bestPR.reps}</span>
                    <span class="pr-date">${formatDate(bestPR.date)}</span>
                </div>
            </div>
        `;
    }).join('');
}

function filterPRs(filter) {
    document.querySelectorAll('.filter-tabs .tab').forEach(tab => {
        tab.classList.toggle('active', tab.dataset.filter === filter);
    });
    renderAllPRs(filter);
}

// ==================== EXERCISES LIST ====================

async function renderExercisesList(filter = '') {
    const exercises = await getExercises();
    const container = document.getElementById('exercises-list');

    const filtered = exercises.filter(e =>
        e.name.toLowerCase().includes(filter.toLowerCase()) ||
        e.muscle.toLowerCase().includes(filter.toLowerCase())
    );

    container.innerHTML = filtered.map(exercise => `
        <div class="exercise-item">
            <div class="exercise-item-header">
                <div>
                    <span class="name">${exercise.name}</span>
                    <span class="muscle">${exercise.muscle} | ${exercise.category}</span>
                </div>
            </div>
        </div>
    `).join('');
}

function filterExercisesList() {
    const filter = document.getElementById('exercises-search').value;
    renderExercisesList(filter);
}

// ==================== UTILITIES ====================

function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatShortDate(date) {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function formatDuration(ms) {
    const seconds = Math.floor(ms / 1000);
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function formatNumber(num) {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast ${type}`;

    setTimeout(() => {
        toast.classList.add('hidden');
    }, 3000);
}

// ==================== INITIALIZATION ====================

async function initApp() {
    initNavigation();

    const active = await getActiveWorkout();
    if (active) {
        navigateTo('workout');
    } else {
        await renderDashboard();
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', initFirebase);
