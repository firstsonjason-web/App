const handleSignIn = async () => {
  if (!loginEmail.trim() || !loginPassword.trim()) {
    Alert.alert('Error', 'Please fill in all fields');
    return;
  }

  if (!loginEmail.includes('@')) {
    Alert.alert('Error', 'Please enter a valid email address');
    return;
  }

  setLoading(true);

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: loginEmail.trim().toLowerCase(), // Normalize email
      password: loginPassword,
    });

    if (error) {
      console.error('Supabase sign-in error:', error); // Log full error for debugging
      Alert.alert('Sign In Failed', error.message || 'An error occurred during sign-in.');
      return;
    }

    if (!data.user) {
      Alert.alert('Error', 'No user data returned. Please try again.');
      return;
    }

    // Fetch user profile from database
    const { data: profileData, error: profileError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError); // Log profile error
      Alert.alert('Error', 'Failed to load user profile: ' + profileError.message);
      return;
    }

    if (profileData) {
      const profile: UserProfile = {
        name: profileData.full_name,
        email: profileData.email,
        addictionLevel: 'moderate', // Default, will be updated from assessment
        score: 0, // Default, will be updated from assessment
        completedAt: profileData.created_at,
        password: '', // Don't store password locally
      };

      // Check for existing assessment
      const { data: assessmentData, error: assessmentError } = await supabase
        .from('user_assessments')
        .select('*')
        .eq('user_id', data.user.id)
        .order('completed_at', { ascending: false })
        .limit(1)
        .single();

      if (assessmentError && !assessmentError.message.includes('No rows found')) {
        console.error('Assessment fetch error:', assessmentError);
        Alert.alert('Error', 'Failed to load assessment data: ' + assessmentError.message);
        return;
      }

      if (assessmentData) {
        profile.addictionLevel = assessmentData.addiction_level as 'low' | 'moderate' | 'high';
        profile.score = assessmentData.total_score;
        profile.completedAt = assessmentData.completed_at;
      }

      setUserProfile(profile);
      await AsyncStorage.setItem('userProfile', JSON.stringify(profile));
      await AsyncStorage.setItem('addictionLevel', profile.addictionLevel);

      Alert.alert(
        'Sign In Successful!',
        `Welcome back, ${profile.name}! You will now be redirected to the Home page.`,
        [
          {
            text: 'Go to Home',
            onPress: () => setCurrentStep('results'),
          },
        ]
      );
    } else {
      Alert.alert('Error', 'No profile data found for this user.');
    }
  } catch (error) {
    console.error('Unexpected error during sign-in:', error);
    Alert.alert('Error', 'An unexpected error occurred. Please try again.');
  } finally {
    setLoading(false);
  }
};