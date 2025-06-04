-- Kavo UI
local Library = loadstring(game:HttpGet("https://raw.githubusercontent.com/xHeptc/Kavo-UI-Library/main/source.lua"))()
local Window = Library.CreateLib("IceXHub Ultimate+", "Midnight")

-- Services
local Players = game:GetService("Players")
local VirtualInputManager = game:GetService("VirtualInputManager")
local TweenService = game:GetService("TweenService")
local RunService = game:GetService("RunService")
local HttpService = game:GetService("HttpService")
local LocalPlayer = Players.LocalPlayer
local Workspace = game:GetService("Workspace")

-- Variables
local AutoFarm = false
local AutoSkill = false
local MobLock = false
local HitboxExpand = false
local ChestESP = false
local AutoCollectChest = false
local FPSSaver = false
local PlayerTracker = false

local TargetMobName = "Bandit"
local FarmDistance = 10
local FastAttackDelay = 0.1
local HitboxSize = Vector3.new(20, 20, 20)
local SaveFileName = "IceXHubSettings"
-- Save/Load Settings
local function SaveSettings()
    local data = {
        AutoFarm = AutoFarm,
        AutoSkill = AutoSkill,
        MobLock = MobLock,
        HitboxExpand = HitboxExpand,
        ChestESP = ChestESP,
        AutoCollectChest = AutoCollectChest,
        FPSSaver = FPSSaver,
        PlayerTracker = PlayerTracker,
        TargetMobName = TargetMobName,
        FarmDistance = FarmDistance,
        FastAttackDelay = FastAttackDelay,
    }
    writefile(SaveFileName..".json", HttpService:JSONEncode(data))
end

local function LoadSettings()
    if isfile(SaveFileName..".json") then
        local data = HttpService:JSONDecode(readfile(SaveFileName..".json"))
        AutoFarm = data.AutoFarm
        AutoSkill = data.AutoSkill
        MobLock = data.MobLock
        HitboxExpand = data.HitboxExpand
        ChestESP = data.ChestESP
        AutoCollectChest = data.AutoCollectChest
        FPSSaver = data.FPSSaver
        PlayerTracker = data.PlayerTracker
        TargetMobName = data.TargetMobName
        FarmDistance = data.FarmDistance
        FastAttackDelay = data.FastAttackDelay
    end
end

-- ฟังก์ชันหามอนใกล้สุด
local function GetNearestMob()
    local nearestMob = nil
    local nearestDistance = math.huge
    if not Workspace:FindFirstChild("Enemies") then return nil end
    for _, mob in pairs(Workspace.Enemies:GetChildren()) do
        if mob.Name == TargetMobName and mob:FindFirstChild("Humanoid") and mob.Humanoid.Health > 0 and mob:FindFirstChild("HumanoidRootPart") then
            local dist = (mob.HumanoidRootPart.Position - LocalPlayer.Character.HumanoidRootPart.Position).Magnitude
            if dist < nearestDistance and dist <= FarmDistance then
                nearestDistance = dist
                nearestMob = mob
            end
        end
    end
    return nearestMob, nearestDistance
end

-- บินสมูธไปหามอน
local function SmoothFlyTo(pos)
    local hrp = LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
    if not hrp then return end
    local tween = TweenService:Create(hrp, TweenInfo.new(0.3), {CFrame = CFrame.new(pos + Vector3.new(0, 5, 0))})
    tween:Play()
    tween.Completed:Wait()
end
-- Auto Equip Tool / หมัดเปล่า
local function AutoEquip()
    local character = LocalPlayer.Character
    if not character then return end
    local tool = character:FindFirstChildOfClass("Tool") or LocalPlayer.Backpack:FindFirstChildOfClass("Tool")
    if tool then
        tool.Parent = character
        tool:Activate()
    else
        game:GetService("VirtualUser"):Button1Down(Vector2.new(0,0), workspace.CurrentCamera.CFrame)
        task.wait(0.1)
        game:GetService("VirtualUser"):Button1Up(Vector2.new(0,0), workspace.CurrentCamera.CFrame)
    end
end

-- กดสกิล Z/X/C
local function UseSkills()
    for _, key in ipairs({"Z","X","C"}) do
        VirtualInputManager:SendKeyEvent(true, key, false, game)
        task.wait(0.05)
        VirtualInputManager:SendKeyEvent(false, key, false, game)
    end
end

-- ขยาย Hitbox (เฉพาะ Client)
local function ExpandHitbox()
    if not Workspace:FindFirstChild("Enemies") then return end
    for _, mob in pairs(Workspace.Enemies:GetChildren()) do
        if mob:FindFirstChild("HumanoidRootPart") and mob:FindFirstChild("Humanoid") and mob.Humanoid.Health > 0 then
            mob.HumanoidRootPart.Size = HitboxSize
            mob.HumanoidRootPart.Transparency = 0.5
            mob.HumanoidRootPart.CanCollide = false
        end
    end
end

-- รีเซ็ต Hitbox กลับปกติ
local function ResetHitbox()
    if not Workspace:FindFirstChild("Enemies") then return end
    for _, mob in pairs(Workspace.Enemies:GetChildren()) do
        if mob:FindFirstChild("HumanoidRootPart") then
            mob.HumanoidRootPart.Size = Vector3.new(2, 2, 1)
            mob.HumanoidRootPart.Transparency = 1
            mob.HumanoidRootPart.CanCollide = true
        end
    end
end
-- ฟังก์ชัน Auto Farm หลัก
local function AutoFarmFunc()
    if not AutoFarm then return end
    local mob, dist = GetNearestMob()
    if mob and dist then
        -- บินไปหามอน
        SmoothFlyTo(mob.HumanoidRootPart.Position)

        -- ล็อคเป้า
        if MobLock then
            local hrp = LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
            if hrp then
                hrp.CFrame = CFrame.new(mob.HumanoidRootPart.Position + Vector3.new(0, 3, 0))
            end
        end

        -- ขยาย Hitbox ถ้าเปิด
        if HitboxExpand then
            ExpandHitbox()
        else
            ResetHitbox()
        end

        -- กดสกิลอัตโนมัติถ้าเปิด
        if AutoSkill then
            UseSkills()
        end

        -- กดโจมตีเร็ว
        AutoEquip()
        VirtualInputManager:SendKeyEvent(true, "0", false, game) -- กดโจมตี (ถ้าตั้งปุ่ม 0 เป็นโจมตี)
        task.wait(FastAttackDelay)
        VirtualInputManager:SendKeyEvent(false, "0", false, game)
    else
        -- ถ้าไม่เจอมอน ให้รอและวนใหม่
        task.wait(0.5)
    end
end

-- วน Auto Farm ทุกเฟรม
RunService.Heartbeat:Connect(function()
    if AutoFarm then
        AutoFarmFunc()
    end
end)
-- โหลดตั้งค่าตอนเริ่ม
LoadSettings()

-- สร้าง Tab และ Section
local FarmTab = Window:NewTab("Farm")
local FarmSection = FarmTab:NewSection("Auto Farm Settings")

-- ปุ่มเปิด/ปิด AutoFarm
FarmSection:NewToggle("Auto Farm", "เปิด/ปิด Auto Farm", function(state)
    AutoFarm = state
    SaveSettings()
end):Set(AutoFarm)

-- ปุ่มเปิด/ปิด AutoSkill
FarmSection:NewToggle("Auto Skill (Z/X/C)", "ใช้สกิลอัตโนมัติ", function(state)
    AutoSkill = state
    SaveSettings()
end):Set(AutoSkill)

-- ปุ่มเปิด/ปิด Mob Lock
FarmSection:NewToggle("Mob Lock", "ล็อคหัวมอน", function(state)
    MobLock = state
    SaveSettings()
end):Set(MobLock)

-- ปุ่มเปิด/ปิด Hitbox Expand
FarmSection:NewToggle("Expand Hitbox", "ขยาย Hitbox มอนสเตอร์", function(state)
    HitboxExpand = state
    if not state then
        ResetHitbox()
    end
    SaveSettings()
end):Set(HitboxExpand)

-- เลือกมอนสเตอร์เป้าหมาย
FarmSection:NewTextbox("Target Mob Name", "ใส่ชื่อมอนสเตอร์ที่จะฟาร์ม", function(text)
    TargetMobName = text
    SaveSettings()
end)

-- ตั้งระยะฟาร์ม
FarmSection:NewSlider("Farm Distance", "ระยะการฟาร์ม (10-100)", 100, 10, function(value)
    FarmDistance = value
    SaveSettings()
end):Set(FarmDistance)

-- ตั้งความเร็วโจมตี
FarmSection:NewSlider("Fast Attack Delay", "ความหน่วงระหว่างโจมตี (0.05-1)", 1, 0.05, function(value)
    FastAttackDelay = value
    SaveSettings()
end):Set(FastAttackDelay)
-- Chest ESP
local function CreateESP(chest)
    local BillboardGui = Instance.new("BillboardGui", chest)
    BillboardGui.Name = "ChestESP"
    BillboardGui.Size = UDim2.new(0, 100, 0, 40)
    BillboardGui.Adornee = chest
    BillboardGui.AlwaysOnTop = true
    
    local TextLabel = Instance.new("TextLabel", BillboardGui)
    TextLabel.Size = UDim2.new(1, 0, 1, 0)
    TextLabel.BackgroundTransparency = 1
    TextLabel.TextColor3 = Color3.fromRGB(255, 215, 0)
    TextLabel.TextStrokeTransparency = 0
    TextLabel.Font = Enum.Font.SourceSansBold
    TextLabel.TextSize = 18
    TextLabel.Text = "Chest"
end

local function RemoveESP()
    for _, chest in pairs(Workspace:GetChildren()) do
        if chest.Name == "Chest" and chest:FindFirstChild("ChestESP") then
            chest.ChestESP:Destroy()
        end
    end
end

-- Auto Collect Chest
local function AutoCollect()
    for _, chest in pairs(Workspace:GetChildren()) do
        if chest.Name == "Chest" and chest:FindFirstChild("TouchInterest") then
            local dist = (chest.Position - LocalPlayer.Character.HumanoidRootPart.Position).Magnitude
            if dist <= FarmDistance then
                -- Teleport to chest to collect
                LocalPlayer.Character.HumanoidRootPart.CFrame = CFrame.new(chest.Position + Vector3.new(0, 3, 0))
                task.wait(0.3)
            end
        end
    end
end

-- Player Tracker
local function TrackPlayers()
    for _, player in pairs(Players:GetPlayers()) do
        if player ~= LocalPlayer and player.Character and player.Character:FindFirstChild("HumanoidRootPart") then
            local distance = (player.Character.HumanoidRootPart.Position - LocalPlayer.Character.HumanoidRootPart.Position).Magnitude
            print("Player:", player.Name, "Distance:", math.floor(distance))
            -- เพิ่ม UI แสดงระยะได้ตามต้องการ
        end
    end
end

-- FPS Saver (ปิดการแสดงผลบางอย่างเพื่อช่วยเพิ่ม FPS)
local function EnableFPSSaver(state)
    if state then
        Workspace.DescendantAdded:Connect(function(obj)
            if obj:IsA("ParticleEmitter") or obj:IsA("Trail") then
                obj.Enabled = false
            end
        end)
    else
        -- เปิดกลับ
        for _, obj in pairs(Workspace:GetDescendants()) do
            if obj:IsA("ParticleEmitter") or obj:IsA("Trail") then
                obj.Enabled = true
            end
        end
    end
end
-- ฟังก์ชันหลัก AutoFarm
local function AutoFarmFunc()
    while AutoFarm do
        task.wait(0.1)

        if not LocalPlayer.Character or not LocalPlayer.Character:FindFirstChild("HumanoidRootPart") then
            task.wait(1)
            continue
        end

        local mob, dist = GetNearestMob()
        if mob then
            -- บินไปหา mob
            SmoothFlyTo(mob.HumanoidRootPart.Position)
            
            -- Mob Lock ถ้าเปิด
            if MobLock then
                LocalPlayer.Character.HumanoidRootPart.CFrame = mob.HumanoidRootPart.CFrame * CFrame.new(0, 3, 0)
            end

            -- ขยาย Hitbox ถ้าเปิด
            if HitboxExpand then
                ExpandHitbox()
            else
                ResetHitbox()
            end

            -- ใช้สกิลถ้าเปิด
            if AutoSkill then
                UseSkills()
            end

            -- กดโจมตีเร็ว
            AutoEquip()
            task.wait(FastAttackDelay)

        else
            -- ถ้าไม่มีมอนสเตอร์ใกล้ ให้รอและรีเซ็ต Hitbox
            ResetHitbox()
            task.wait(1)
        end

        -- ฟีเจอร์ ChestESP
        if ChestESP then
            for _, chest in pairs(Workspace:GetChildren()) do
                if chest.Name == "Chest" and not chest:FindFirstChild("ChestESP") then
                    CreateESP(chest)
                end
            end
        else
            RemoveESP()
        end

        -- ฟีเจอร์ Auto Collect Chest
        if AutoCollectChest then
            AutoCollect()
        end

        -- ฟีเจอร์ Player Tracker
        if PlayerTracker then
            TrackPlayers()
        end

        -- FPS Saver
        EnableFPSSaver(FPSSaver)
    end
end

-- ฟังก์ชันเปิด/ปิด AutoFarm
local function ToggleAutoFarm(state)
    AutoFarm = state
    if AutoFarm then
        task.spawn(AutoFarmFunc)
    else
        ResetHitbox()
        RemoveESP()
    end
end
-- Chest ESP
local function CreateChestESP()
    if not Workspace:FindFirstChild("Chests") then return end
    for _, chest in pairs(Workspace.Chests:GetChildren()) do
        if chest:FindFirstChild("Handle") and not chest.Handle:FindFirstChild("ChestESP") then
            local billboardGui = Instance.new("BillboardGui", chest.Handle)
            billboardGui.Name = "ChestESP"
            billboardGui.Size = UDim2.new(0, 100, 0, 50)
            billboardGui.Adornee = chest.Handle
            billboardGui.AlwaysOnTop = true

            local textLabel = Instance.new("TextLabel", billboardGui)
            textLabel.Size = UDim2.new(1, 0, 1, 0)
            textLabel.BackgroundTransparency = 1
            textLabel.Text = "Chest"
            textLabel.TextColor3 = Color3.new(1, 1, 0)
            textLabel.TextStrokeColor3 = Color3.new(0, 0, 0)
            textLabel.TextStrokeTransparency = 0
        end
    end
end

local function RemoveChestESP()
    if not Workspace:FindFirstChild("Chests") then return end
    for _, chest in pairs(Workspace.Chests:GetChildren()) do
        if chest:FindFirstChild("Handle") then
            local esp = chest.Handle:FindFirstChild("ChestESP")
            if esp then
                esp:Destroy()
            end
        end
    end
end

-- Auto Collect Chest
local function AutoCollectChests()
    if not Workspace:FindFirstChild("Chests") then return end
    for _, chest in pairs(Workspace.Chests:GetChildren()) do
        if chest:FindFirstChild("Handle") and (chest.Handle.Position - LocalPlayer.Character.HumanoidRootPart.Position).Magnitude <= 10 then
            firetouchinterest(LocalPlayer.Character.HumanoidRootPart, chest.Handle, 0)
            task.wait(0.1)
            firetouchinterest(LocalPlayer.Character.HumanoidRootPart, chest.Handle, 1)
        end
    end
end

-- Player Tracker
local function TrackPlayers()
    for _, player in pairs(Players:GetPlayers()) do
        if player ~= LocalPlayer and player.Character and player.Character:FindFirstChild("HumanoidRootPart") then
            if not player.Character.HumanoidRootPart:FindFirstChild("TrackerESP") then
                local billboardGui = Instance.new("BillboardGui", player.Character.HumanoidRootPart)
                billboardGui.Name = "TrackerESP"
                billboardGui.Size = UDim2.new(0, 100, 0, 50)
                billboardGui.Adornee = player.Character.HumanoidRootPart
                billboardGui.AlwaysOnTop = true

                local textLabel = Instance.new("TextLabel", billboardGui)
                textLabel.Size = UDim2.new(1, 0, 1, 0)
                textLabel.BackgroundTransparency = 1
                textLabel.Text = player.Name
                textLabel.TextColor3 = Color3.new(1, 0, 0)
                textLabel.TextStrokeColor3 = Color3.new(0, 0, 0)
                textLabel.TextStrokeTransparency = 0
            end
        end
    end
end

local function RemovePlayerTrackers()
    for _, player in pairs(Players:GetPlayers()) do
        if player.Character and player.Character:FindFirstChild("HumanoidRootPart") then
            local esp = player.Character.HumanoidRootPart:FindFirstChild("TrackerESP")
            if esp then
                esp:Destroy()
            end
        end
    end
end
-- Load Settings at start
LoadSettings()

-- Main GUI
local FarmTab = Window:NewTab("Farm")
local FarmSection = FarmTab:NewSection("Auto Farm Settings")

FarmSection:NewToggle("Auto Farm", "เปิด/ปิด ฟาร์มอัตโนมัติ", function(state)
    AutoFarm = state
    SaveSettings()
    if not state then
        -- Reset anything needed on stop
    end
end)

FarmSection:NewToggle("Auto Skill", "ใช้สกิลอัตโนมัติ", function(state)
    AutoSkill = state
    SaveSettings()
end)

FarmSection:NewToggle("Mob Lock", "ล็อกเป้าหมายมอนสเตอร์", function(state)
    MobLock = state
    SaveSettings()
end)

FarmSection:NewToggle("Hitbox Expand", "ขยายขนาด Hitbox ของมอนสเตอร์", function(state)
    HitboxExpand = state
    if state then
        ExpandHitbox()
    else
        ResetHitbox()
    end
    SaveSettings()
end)

FarmSection:NewToggle("Chest ESP", "แสดง Chest ESP", function(state)
    ChestESP = state
    if state then
        CreateChestESP()
    else
        RemoveChestESP()
    end
    SaveSettings()
end)

FarmSection:NewToggle("Auto Collect Chest", "เก็บ Chest อัตโนมัติ", function(state)
    AutoCollectChest = state
    SaveSettings()
end)

FarmSection:NewToggle("FPS Saver", "เปิดโหมดประหยัด FPS", function(state)
    FPSSaver = state
    SaveSettings()
end)

FarmSection:NewToggle("Player Tracker", "แสดงชื่อผู้เล่นอื่น", function(state)
    PlayerTracker = state
    if state then
        TrackPlayers()
    else
        RemovePlayerTrackers()
    end
    SaveSettings()
end)

FarmSection:NewSlider("Farm Distance", "ระยะห่างสำหรับฟาร์ม", 100, 5, function(value)
    FarmDistance = value
    SaveSettings()
end)

FarmSection:NewSlider("Fast Attack Delay", "ดีเลย์ระหว่างโจมตีเร็ว", 1, 0.05, function(value)
    FastAttackDelay = value
    SaveSettings()
end)

-- Main loop
spawn(function()
    while true do
        task.wait(0.1)
        if AutoFarm then
            local mob, dist = GetNearestMob()
            if mob then
                if MobLock then
                    LocalPlayer.Character.HumanoidRootPart.CFrame = mob.HumanoidRootPart.CFrame * CFrame.new(0, 5, 0)
                else
                    SmoothFlyTo(mob.HumanoidRootPart.Position)
                end
                AutoEquip()
                for i = 1, 5 do
                    -- Attack mob multiple times
                    VirtualInputManager:SendMouseButtonEvent(1, 1, true, game)
                    task.wait(FastAttackDelay)
                    VirtualInputManager:SendMouseButtonEvent(1, 1, false, game)
                end
                if AutoSkill then
                    UseSkills()
                end
            else
                -- No mob found, can idle or move
            end
        end

        if ChestESP then
            CreateChestESP()
        end

        if AutoCollectChest then
            AutoCollectChests()
        end

        if PlayerTracker then
            TrackPlayers()
        end

        if HitboxExpand then
            ExpandHitbox()
        end

        if FPSSaver then
            -- Implement FPS saver logic here, like disabling particle effects, lowering graphics, etc.
        end
    end
end)
-- ตารางเก็บ Chest ESP ที่สร้างขึ้น
local chestESPTable = {}

-- สร้าง ESP ให้ Chest
function CreateChestESP()
    if not Workspace:FindFirstChild("Chests") then return end
    for _, chest in pairs(Workspace.Chests:GetChildren()) do
        if chest:IsA("BasePart") or chest:FindFirstChildWhichIsA("BasePart") then
            local part = chest:IsA("BasePart") and chest or chest:FindFirstChildWhichIsA("BasePart")
            if not chestESPTable[chest] then
                local billboardGui = Instance.new("BillboardGui")
                billboardGui.Adornee = part
                billboardGui.Size = UDim2.new(0, 100, 0, 40)
                billboardGui.AlwaysOnTop = true
                billboardGui.Name = "ChestESP"
                
                local textLabel = Instance.new("TextLabel", billboardGui)
                textLabel.Size = UDim2.new(1, 0, 1, 0)
                textLabel.BackgroundTransparency = 1
                textLabel.Text = "Chest"
                textLabel.TextColor3 = Color3.new(1, 1, 0)
                textLabel.TextStrokeTransparency = 0
                textLabel.Font = Enum.Font.SourceSansBold
                textLabel.TextScaled = true
                
                billboardGui.Parent = game.CoreGui
                chestESPTable[chest] = billboardGui
            end
        end
    end
end

-- ลบ ESP ของ Chest ออกทั้งหมด
function RemoveChestESP()
    for chest, esp in pairs(chestESPTable) do
        if esp and esp.Parent then
            esp:Destroy()
        end
    end
    chestESPTable = {}
end

-- ฟังก์ชันเก็บ Chest อัตโนมัติ
function AutoCollectChests()
    if not Workspace:FindFirstChild("Chests") then return end
    local hrp = LocalPlayer.Character and LocalPlayer.Character:FindFirstChild("HumanoidRootPart")
    if not hrp then return end
    for _, chest in pairs(Workspace.Chests:GetChildren()) do
        local part = chest:IsA("BasePart") and chest or chest:FindFirstChildWhichIsA("BasePart")
        if part then
            local dist = (part.Position - hrp.Position).Magnitude
            if dist < 20 then
                -- Teleport to chest or move close enough to collect
                hrp.CFrame = CFrame.new(part.Position + Vector3.new(0, 5, 0))
                task.wait(0.5)
            end
        end
    end
end

-- ตารางเก็บ Player Tracker GUI
local playerTrackerTable = {}

-- แสดงชื่อผู้เล่นอื่นเหนือหัว
function TrackPlayers()
    for _, player in pairs(Players:GetPlayers()) do
        if player ~= LocalPlayer and player.Character and player.Character:FindFirstChild("HumanoidRootPart") then
            if not playerTrackerTable[player] then
                local billboardGui = Instance.new("BillboardGui")
                billboardGui.Adornee = player.Character.HumanoidRootPart
                billboardGui.Size = UDim2.new(0, 100, 0, 40)
                billboardGui.AlwaysOnTop = true
                billboardGui.Name = "PlayerTracker"
                
                local textLabel = Instance.new("TextLabel", billboardGui)
                textLabel.Size = UDim2.new(1, 0, 1, 0)
                textLabel.BackgroundTransparency = 1
                textLabel.Text = player.Name
                textLabel.TextColor3 = Color3.new(0, 1, 0)
                textLabel.TextStrokeTransparency = 0
                textLabel.Font = Enum.Font.SourceSansBold
                textLabel.TextScaled = true
                
                billboardGui.Parent = game.CoreGui
                playerTrackerTable[player] = billboardGui
            end
        end
    end
end

-- ลบ Player Tracker ทั้งหมด
function RemovePlayerTrackers()
    for player, gui in pairs(playerTrackerTable) do
        if gui and gui.Parent then
            gui:Destroy()
        end
    end
    playerTrackerTable = {}
end

-- ล้าง GUI ทุกอย่างตอนปิดสคริปต์ (เรียกใช้ถ้าต้องการ)
function ClearAllGUI()
    RemoveChestESP()
    RemovePlayerTrackers()
    ResetHitbox()
end
-- โหลดค่าเก่าถ้ามี
LoadSettings()

-- สร้าง Tab ฟาร์ม
local FarmTab = Window:NewTab("Farm")
local FarmSection = FarmTab:NewSection("Auto Farm & Settings")

FarmSection:NewToggle("Auto Farm", "เปิด/ปิด ฟาร์มอัตโนมัติ", function(state)
    AutoFarm = state
    SaveSettings()
end)

FarmSection:NewToggle("Auto Skill (Z/X/C)", "กดใช้สกิลอัตโนมัติ", function(state)
    AutoSkill = state
    SaveSettings()
end)

FarmSection:NewToggle("Mob Lock", "ล็อกเป้าหมายมอนสเตอร์", function(state)
    MobLock = state
    SaveSettings()
end)

FarmSection:NewToggle("Expand Hitbox", "ขยายขนาด Hitbox มอนสเตอร์", function(state)
    HitboxExpand = state
    if not state then
        ResetHitbox()
    end
    SaveSettings()
end)

FarmSection:NewToggle("Chest ESP", "แสดง Chest ด้วย ESP", function(state)
    ChestESP = state
    if not state then
        RemoveChestESP()
    end
    SaveSettings()
end)

FarmSection:NewToggle("Auto Collect Chest", "เก็บ Chest อัตโนมัติ", function(state)
    AutoCollectChest = state
    SaveSettings()
end)

FarmSection:NewToggle("FPS Saver", "เปิดโหมดประหยัด FPS (ลดโหลดระบบ)", function(state)
    FPSSaver = state
    SaveSettings()
end)

FarmSection:NewToggle("Player Tracker", "แสดงชื่อผู้เล่นอื่นเหนือหัว", function(state)
    PlayerTracker = state
    if not state then
        RemovePlayerTrackers()
    end
    SaveSettings()
end)

FarmSection:NewSlider("Farm Distance", "ระยะฟาร์มมอนสเตอร์ (เมตร)", 50, 5, function(value)
    FarmDistance = value
    SaveSettings()
end)

FarmSection:NewSlider("Fast Attack Delay", "หน่วงเวลาระหว่างโจมตี (วินาที)", 1, 0.05, function(value)
    FastAttackDelay = value
    SaveSettings()
end)

FarmSection:NewTextbox("Target Mob Name", "ใส่ชื่อมอนสเตอร์ที่จะฟาร์ม", function(text)
    TargetMobName = text
    SaveSettings()
end)

-- ฟังก์ชันหลัก Loop อัตโนมัติ
spawn(function()
    while true do
        task.wait(0.1)
        if AutoFarm then
            local mob, dist = GetNearestMob()
            if mob and mob:FindFirstChild("HumanoidRootPart") then
                if MobLock then
                    LocalPlayer.Character.HumanoidRootPart.CFrame = mob.HumanoidRootPart.CFrame * CFrame.new(0, 5, 0)
                else
                    SmoothFlyTo(mob.HumanoidRootPart.Position)
                end
                AutoEquip()
                if AutoSkill then
                    UseSkills()
                end
                -- กดโจมตีด้วยเมาส์ซ้าย
                VirtualInputManager:SendMouseButtonEvent(0, 0, 0, true, game, 1)
                task.wait(FastAttackDelay)
                VirtualInputManager:SendMouseButtonEvent(0, 0, 0, false, game, 1)
            end
        end

        if HitboxExpand then
            ExpandHitbox()
        end

        if ChestESP then
            CreateChestESP()
        end

        if AutoCollectChest then
            AutoCollectChests()
        end

        if PlayerTracker then
            TrackPlayers()
        end

        if FPSSaver then
            -- ลดโหลดระบบอาจจะลดความละเอียดหรือลดการอัปเดตบางอย่าง (ถ้ามีโค้ดเพิ่มเติมใส่ตรงนี้)
        end
    end
end)
-- Chest ESP
local ChestESPObjects = {}

local function CreateChestESP()
    if not Workspace:FindFirstChild("Chests") then return end
    for _, chest in pairs(Workspace.Chests:GetChildren()) do
        if chest:IsA("BasePart") and not ChestESPObjects[chest] then
            local box = Instance.new("BoxHandleAdornment")
            box.Adornee = chest
            box.AlwaysOnTop = true
            box.ZIndex = 10
            box.Size = chest.Size + Vector3.new(0.5, 0.5, 0.5)
            box.Transparency = 0.5
            box.Color3 = Color3.fromRGB(255, 215, 0) -- สีทอง
            box.Parent = chest
            ChestESPObjects[chest] = box
        end
    end
end

local function RemoveChestESP()
    for chest, box in pairs(ChestESPObjects) do
        if box and box.Parent then
            box:Destroy()
        end
    end
    ChestESPObjects = {}
end

-- Auto Collect Chest
local function AutoCollectChests()
    if not Workspace:FindFirstChild("Chests") then return end
    for _, chest in pairs(Workspace.Chests:GetChildren()) do
        if chest:IsA("BasePart") then
            local dist = (chest.Position - LocalPlayer.Character.HumanoidRootPart.Position).Magnitude
            if dist < 15 then
                firetouchinterest(LocalPlayer.Character.HumanoidRootPart, chest, 0)
                firetouchinterest(LocalPlayer.Character.HumanoidRootPart, chest, 1)
            end
        end
    end
end

-- Player Tracker
local PlayerTrackers = {}

local function CreatePlayerTracker(player)
    if PlayerTrackers[player] then return end
    local billboard = Instance.new("BillboardGui")
    billboard.Adornee = player.Character and player.Character:FindFirstChild("HumanoidRootPart")
    if not billboard.Adornee then return end
    billboard.Size = UDim2.new(0, 100, 0, 40)
    billboard.AlwaysOnTop = true

    local textLabel = Instance.new("TextLabel")
    textLabel.Size = UDim2.new(1, 0, 1, 0)
    textLabel.BackgroundTransparency = 1
    textLabel.TextColor3 = Color3.new(1, 1, 1)
    textLabel.TextStrokeTransparency = 0
    textLabel.Text = player.Name
    textLabel.Parent = billboard

    billboard.Parent = player.Character.HumanoidRootPart
    PlayerTrackers[player] = billboard
end

local function RemovePlayerTrackers()
    for player, tracker in pairs(PlayerTrackers) do
        if tracker and tracker.Parent then
            tracker:Destroy()
        end
    end
    PlayerTrackers = {}
end

local function TrackPlayers()
    for _, player in pairs(Players:GetPlayers()) do
        if player ~= LocalPlayer and player.Character and player.Character:FindFirstChild("HumanoidRootPart") then
            CreatePlayerTracker(player)
        end
    end
end

-- Events to handle player joining/leaving to maintain trackers
Players.PlayerRemoving:Connect(function(player)
    if PlayerTrackers[player] then
        PlayerTrackers[player]:Destroy()
        PlayerTrackers[player] = nil
    end
end)

Players.PlayerAdded:Connect(function(player)
    if PlayerTracker then
        player.CharacterAdded:Connect(function(character)
            wait(1)
            if PlayerTracker then
                CreatePlayerTracker(player)
            end
        end)
    end
end)
-- ฟังก์ชันหลัก Auto Farm
local function AutoFarmFunction()
    while AutoFarm do
        task.wait()
        local mob, dist = GetNearestMob()
        if mob and mob.HumanoidRootPart then
            SmoothFlyTo(mob.HumanoidRootPart.Position)
            AutoEquip()
            if AutoSkill then
                UseSkills()
            end
            if MobLock then
                LocalPlayer.Character.HumanoidRootPart.CFrame = mob.HumanoidRootPart.CFrame * CFrame.new(0, 5, 0)
            end
            task.wait(FastAttackDelay)
        else
            task.wait(1)
        end
        if HitboxExpand then
            ExpandHitbox()
        else
            ResetHitbox()
        end
        if AutoCollectChest then
            AutoCollectChests()
        end
        if ChestESP then
            CreateChestESP()
        else
            RemoveChestESP()
        end
        if PlayerTracker then
            TrackPlayers()
        else
            RemovePlayerTrackers()
        end
        if FPSSaver then
            -- ตัวอย่าง: ปิดเอฟเฟกต์บางอย่างเพื่อลด FPS
            for _, v in pairs(Workspace:GetDescendants()) do
                if v:IsA("ParticleEmitter") or v:IsA("Trail") then
                    v.Enabled = false
                end
            end
        end
    end
end

-- สร้าง Thread Auto Farm
coroutine.wrap(function()
    while true do
        if AutoFarm then
            AutoFarmFunction()
        else
            task.wait(1)
        end
        task.wait(0.1)
    end
end)()

-- สร้าง GUI
local FarmTab = Window:NewTab("Farm")
local FarmSection = FarmTab:NewSection("Main")

FarmSection:NewToggle("Auto Farm", "เปิด/ปิด ฟาร์มมอนสเตอร์อัตโนมัติ", function(value)
    AutoFarm = value
    SaveSettings()
end)

FarmSection:NewToggle("Auto Skill (Z/X/C)", "กดใช้สกิลอัตโนมัติ", function(value)
    AutoSkill = value
    SaveSettings()
end)

FarmSection:NewToggle("Mob Lock", "ล็อกตำแหน่งหัวมอนสเตอร์ขณะฟาร์ม", function(value)
    MobLock = value
    SaveSettings()
end)

FarmSection:NewToggle("Expand Hitbox", "ขยาย Hitbox มอนสเตอร์", function(value)
    HitboxExpand = value
    if not value then
        ResetHitbox()
    end
    SaveSettings()
end)

FarmSection:NewSlider("Fast Attack Delay", "ตั้งค่าความเร็วการโจมตี (วินาที)", 1, 0.05, function(value)
    FastAttackDelay = value
    SaveSettings()
end)

local ESPTab = Window:NewTab("ESP")
local ESPSection = ESPTab:NewSection("Chest & Player")

ESPSection:NewToggle("Chest ESP", "แสดง Chest ในแมพ", function(value)
    ChestESP = value
    if not value then
        RemoveChestESP()
    end
    SaveSettings()
end)

ESPSection:NewToggle("Auto Collect Chest", "เก็บ Chest อัตโนมัติ", function(value)
    AutoCollectChest = value
    SaveSettings()
end)

ESPSection:NewToggle("Player Tracker", "แสดงชื่อผู้เล่น", function(value)
    PlayerTracker = value
    if not value then
        RemovePlayerTrackers()
    end
    SaveSettings()
end)

local OtherTab = Window:NewTab("Other")
local OtherSection = OtherTab:NewSection("Performance")

OtherSection:NewToggle("FPS Saver", "ลดเอฟเฟกต์เพื่อเพิ่ม FPS", function(value)
    FPSSaver = value
    SaveSettings()
end)

-- โหลดค่าที่บันทึกไว้ตอนเริ่ม
LoadSettings()
