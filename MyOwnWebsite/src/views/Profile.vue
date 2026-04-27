<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "../stores/auth";

const router = useRouter();
const authStore = useAuthStore();

const isEditing = ref(false);
const editField = ref("");

const user = computed(() => ({
  username: authStore.user?.username || "用户",
  teamName: authStore.user?.username || "用户",
  phone: "18651032383",
  email: "",
  password: "********",
  wechat: "未绑定",
  feishu: "未绑定",
}));

const handleEdit = (field: string) => {
  editField.value = field;
  isEditing.value = true;
};

const handleSave = () => {
  isEditing.value = false;
  editField.value = "";
};

const handleCancel = () => {
  isEditing.value = false;
  editField.value = "";
};

const handleLogout = () => {
  authStore.logout();
  router.push("/login");
};

const handleLeaveTeam = () => {
  // 退出团队逻辑
};

const handleDeleteAccount = () => {
  // 注销账号逻辑
};
</script>

<template>
  <div class="profile-page">
    <header class="profile-header">
      <div class="avatar-container">
        <div class="avatar">
          <span class="avatar-text">{{ user.username.charAt(0) }}</span>
        </div>
        <div class="verified-badge">已实名认证(186******83)</div>
      </div>
    </header>

    <main class="profile-content">
      <div class="profile-item">
        <label class="item-label">用户名</label>
        <div class="item-content">
          <span v-if="!isEditing || editField !== 'username'">{{
            user.username
          }}</span>
          <input v-else v-model="user.username" class="edit-input" />
          <button
            v-if="!isEditing || editField !== 'username'"
            @click="handleEdit('username')"
            class="edit-btn"
          >
            编辑
          </button>
          <div v-else class="edit-actions">
            <button @click="handleSave" class="save-btn">保存</button>
            <button @click="handleCancel" class="cancel-btn">取消</button>
          </div>
        </div>
      </div>

      <div class="profile-item">
        <label class="item-label">团队内备注名</label>
        <div class="item-content">
          <span v-if="!isEditing || editField !== 'teamName'">{{
            user.teamName
          }}</span>
          <input v-else v-model="user.teamName" class="edit-input" />
          <button
            v-if="!isEditing || editField !== 'teamName'"
            @click="handleEdit('teamName')"
            class="edit-btn"
          >
            编辑
          </button>
          <div v-else class="edit-actions">
            <button @click="handleSave" class="save-btn">保存</button>
            <button @click="handleCancel" class="cancel-btn">取消</button>
          </div>
        </div>
      </div>

      <div class="profile-item">
        <label class="item-label">手机号</label>
        <div class="item-content">
          <span>{{ user.phone }}</span>
          <button @click="handleEdit('phone')" class="edit-btn">编辑</button>
        </div>
      </div>

      <div class="profile-item">
        <label class="item-label">邮箱</label>
        <div class="item-content">
          <span>{{ user.email || "未绑定" }}</span>
          <button @click="handleEdit('email')" class="edit-btn">编辑</button>
        </div>
      </div>

      <div class="profile-item">
        <label class="item-label">密码</label>
        <div class="item-content">
          <span>{{ user.password }}</span>
          <button @click="handleEdit('password')" class="edit-btn">编辑</button>
        </div>
      </div>

      <div class="profile-item">
        <label class="item-label">微信</label>
        <div class="item-content">
          <span>{{ user.wechat }}</span>
          <button class="bind-btn">绑定</button>
        </div>
      </div>

      <div class="profile-item">
        <label class="item-label">飞书</label>
        <div class="item-content">
          <span>{{ user.feishu }}</span>
          <button class="bind-btn">绑定</button>
        </div>
      </div>

      <div class="profile-actions">
        <button @click="handleLogout" class="action-btn logout-btn">
          退出登录
        </button>
        <button @click="handleLeaveTeam" class="action-btn leave-btn">
          退出团队
        </button>
        <button @click="handleDeleteAccount" class="action-btn delete-btn">
          注销账号
        </button>
      </div>
    </main>
  </div>
</template>

<style scoped>
.profile-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 2rem;
}

.profile-header {
  text-align: center;
  margin-bottom: 3rem;
}

.avatar-container {
  display: inline-block;
  text-align: center;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
}

.avatar:hover {
  transform: scale(1.1);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
}

.avatar-text {
  font-size: 2rem;
  font-weight: bold;
  color: white;
}

.verified-badge {
  background: #52c41a;
  color: white;
  padding: 0.25rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
}

.profile-content {
  max-width: 600px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}

.profile-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem 0;
  border-bottom: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.profile-item:hover {
  background: #fafafa;
  padding-left: 1rem;
  padding-right: 1rem;
}

.item-label {
  font-size: 1rem;
  font-weight: 600;
  color: #333;
}

.item-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.item-content span {
  font-size: 0.875rem;
  color: #666;
}

.edit-btn {
  padding: 0.5rem 1rem;
  background: #1890ff;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: #40a9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.edit-input {
  padding: 0.5rem;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 0.875rem;
  width: 200px;
}

.edit-actions {
  display: flex;
  gap: 0.5rem;
}

.save-btn {
  padding: 0.5rem 1rem;
  background: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.save-btn:hover {
  background: #52c41a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

.cancel-btn {
  padding: 0.5rem 1rem;
  background: #d9d9d9;
  color: #333;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #bfbfbf;
  transform: translateY(-2px);
}

.bind-btn {
  padding: 0.5rem 1rem;
  background: #52c41a;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.bind-btn:hover {
  background: #52c41a;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(82, 196, 26, 0.3);
}

.profile-actions {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 3rem;
}

.action-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn {
  background: #1890ff;
  color: white;
}

.logout-btn:hover {
  background: #40a9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(24, 144, 255, 0.3);
}

.leave-btn {
  background: #faad14;
  color: white;
}

.leave-btn:hover {
  background: #ffc53d;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(250, 173, 20, 0.3);
}

.delete-btn {
  background: #f5222d;
  color: white;
}

.delete-btn:hover {
  background: #ff4d4f;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(245, 34, 45, 0.3);
}
</style>
