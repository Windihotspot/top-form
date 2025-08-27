<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-100">
    <div class="w-full max-w-md bg-white shadow-2xl rounded-2xl p-6">
      <!-- Tabs -->
      <v-tabs v-model="tab" class="mb-6" >
        <v-tab value="login">Login</v-tab>
        <v-tab value="signup">Sign Up</v-tab>
      </v-tabs>

      <!-- Tab Content -->
      <v-window v-model="tab" class="mt-6">
        <!-- Login -->
        <v-window-item value="login">
          <v-form class="mt-6" ref="loginForm" v-model="loginValid" lazy-validation>
            <v-text-field
              v-model="login.email"
              label="Email"
              type="email"
              variant="outlined"
              :rules="[rules.required, rules.email]"
              class="mb-4"
            />
            <v-text-field
              v-model="login.password"
              label="Password"
              type="password"
              variant="outlined"
              :rules="[rules.required]"
              class="mb-4"
            />
            <v-btn
              color="primary"
              class="w-full py-3  text-white"
              :disabled="!loginValid || loading"
              @click="handleLogin"
            >
              {{ loading ? "Logging in..." : "Login" }}
            </v-btn>
          </v-form>
        </v-window-item>

        <!-- Signup -->
        <v-window-item value="signup">
          <v-form class="mt-6" ref="signupForm" v-model="signupValid" lazy-validation>
            <v-text-field
              v-model="signup.name"
              label="Full Name"
              variant="outlined"
              :rules="[rules.required]"
              class="mb-4"
            />
            <v-text-field
              v-model="signup.email"
              label="Email"
              type="email"
              variant="outlined"
              :rules="[rules.required, rules.email]"
              class="mb-4"
            />
            <v-text-field
              v-model="signup.password"
              label="Password"
              type="password"
              variant="outlined"
              :rules="[rules.required, rules.min(6)]"
              class="mb-4"
            />
            <v-btn
              color="success"
              class="w-full py-3 text-white"
              :disabled="!signupValid || loading"
              @click="handleSignup"
            >
              {{ loading ? "Signing up..." : "Sign Up" }}
            </v-btn>
          </v-form>
        </v-window-item>
      </v-window>
    </div>
  </div>
</template>

<script setup>
import { ref } from "vue";
import axios from "axios";
import { ElNotification } from "element-plus";

const tab = ref("login");
const loading = ref(false);

const loginValid = ref(false);
const signupValid = ref(false);
const signupForm = ref(null)
const loginForm = ref(null)

// Login model
const login = ref({
  email: "",
  password: "",
});

// Signup model
const signup = ref({
  name: "",
  email: "",
  password: "",
});

// Validation rules
const rules = {
  required: (v) => !!v || "Field is required",
  email: (v) => /.+@.+\..+/.test(v) || "E-mail must be valid",
  min: (len) => (v) =>
    (v && v.length >= len) || `Minimum ${len} characters required`,
};

// Handle Login
const handleLogin = async () => {
  if (!(await loginForm.value.validate())) return;
  loading.value = true;
  try {
    const { data } = await axios.post("http://localhost:5000/api/auth/signin", login.value);
    console.log("Login success:", data);

    ElNotification({
      title: "Success",
      message: "✅ Logged in successfully!",
      type: "success",
      position: "top-right",
    });
  } catch (err) {
    ElNotification({
      title: "Error",
      message: err.response?.data?.msg || "Login failed",
      type: "error",
      position: "top-right",
    });
  } finally {
    loading.value = false;
  }
};

// Handle Signup
const handleSignup = async () => {
  if (!(await signupForm.value.validate())) return;
  loading.value = true;
  try {
    const { data } = await axios.post("http://localhost:5000/api/auth/signup", signup.value);
    console.log("Signup success:", data);

    ElNotification({
      title: "Success",
      message: "🎉 Account created successfully!",
      type: "success",
      position: "top-right",
    });

    tab.value = "login"; // Switch to login tab
  } catch (err) {
    ElNotification({
      title: "Error",
      message: err.response?.data?.msg || "Signup failed",
      type: "error",
      position: "top-right",
    });
  } finally {
    loading.value = false;
  }
};
</script>
