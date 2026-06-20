#==============================================================================
#
#  ## @file
#  Syntax Extension Test DSC File for EDK II v1.28.
#
#==============================================================================

[Defines]
  DSC_SPECIFICATION              = 1.28
  PLATFORM_NAME                  = TestPlatform
  PLATFORM_GUID                  = 12345678-ABCD-4321-8888-A1B2C3D4E5F6
  PLATFORM_VERSION               = 0.1
  OUTPUT_DIRECTORY               = Build/TestPlatform
  SUPPORTED_ARCHITECTURES        = IA32|X64
  BUILD_TARGETS                  = DEBUG|RELEASE
  SKUID_IDENTIFIER               = DEFAULT
  FLASH_DEFINITION               = TestPlatform.fdf

  DEFINE TARGET_VER              = 2
  DEFINE SECURE_ENABLE           = TRUE
  DEFINE COMPILER_SET            = "GCC"

[SkuIds]
  0|DEFAULT
  1|Skelldo|DEFAULT

[DefaultStores]
  0|STANDARD|STR_STANDARD
  1|MANUFACTURING|STR_MANUFACTURING

[LibraryClasses.common]
  BaseLib|MdePkg/Library/BaseLib/BaseLib.inf
  TimerLib|MdePkg/Library/BaseTimerLib/BaseTimerLib.inf

[LibraryClasses.IA32, LibraryClasses.X64]
  CpuLib|UefiCpuPkg/Library/CpuLib/CpuLib.inf

[PcdsFixedAtBuild.common]
  gEfiMdePkgTokenSpaceGuid.PcdDebugPrintErrorLevel|0x80000000

[PcdsFeatureFlag.common]
  gEfiMdePkgTokenSpaceGuid.PcdVerifyNodeEnable|TRUE

[PcdsPatchableInModule.common]
  gEfiMdePkgTokenSpaceGuid.PcdPatchableDirection|0x00

[PcdsDynamicDefault]
  gEfiMdePkgTokenSpaceGuid.PcdDynamicString|"Default"|VOID*|32

[PcdsDynamicHii]
  gEfiMdePkgTokenSpaceGuid.PcdSetupValue|L"Setup"|gTestFormSetGuid|0x0|0
  gEfiMdePkgTokenSpaceGuid.PcdEepromData|L"EepromStorage"|gTestFormSetGuid|0x10|0|EEPROM

[PcdsDynamicVpd]
  gEfiMdePkgTokenSpaceGuid.PcdVpdData|*|16

[PcdsDynamicExDefault]
  gEfiMdePkgTokenSpaceGuid.PcdDynamicExValue|0x00

[PcdsDynamicExHii]
  gEfiMdePkgTokenSpaceGuid.PcdEepromExData|L"EepromExStorage"|gTestFormSetGuid|0x20|0|EEPROM

[PcdsStructured.common]
  gTestTokenSpaceGuid.MyStructPcd.Field1|0x01
  gTestTokenSpaceGuid.MyStructPcd.Field2|L"Test"

!include MdePkg/MdePkgLibs.dsc

!if $(BUILD_TARGET) == "DEBUG" && $(SECURE_ENABLE) == TRUE
[BuildOptions.common]
  MSFT:*_*_*_CC_FLAGS = /D DEBUG_MODE /D SECURE_ON
!elif $(BUILD_TARGET) == "RELEASE" || $(TARGET_VER) >= 2
[BuildOptions.common]
  MSFT:*_*_*_CC_FLAGS = /D RELEASE_MODE
!elif !$(SECURE_ENABLE)
[BuildOptions.common]
  MSFT:*_*_*_CC_FLAGS = /D INSECURE_MODE
!elif $(TARGET_VER) != 0 && $(TARGET_VER) < 5
[BuildOptions.common]
  MSFT:*_*_*_CC_FLAGS = /D EXPERIMENTAL_MODE
!elif $(TARGET_VER) <= 1
[BuildOptions.common]
  MSFT:*_*_*_CC_FLAGS = /D LEGACY_MODE
!elif $(COMPILER_SET) in "GCC, CLANG"
[BuildOptions.common]
  GCC:*_*_*_CC_FLAGS = -DOPEN_SOURCE_COMPILER
!else
  !error "Unsupported configuration combination detected!"
!endif

[Components.IA32]
  MdePkg/Application/HelloWorld/HelloWorld.inf {
    <LibraryClasses>
      TimerLib|MdePkg/Library/BaseTimerLib/BaseTimerLib.inf
    <PcdsFixedAtBuild>
      gEfiMdePkgTokenSpaceGuid.PcdDebugPrintErrorLevel|0x0000000F
    <BuildOptions>
      MSFT:*_*_*_CC_FLAGS = /D MODULE_LOCAL_OVERRIDE
      GCC:*_*_*_CC_FLAGS = -DMODULE_LOCAL_OVERRIDE
  }

[Components.X64]
  MdeModulePkg/Universal/BdsDxe/BdsDxe.inf {
    <LibraryClasses>
      UefiBootManagerLib|MdeModulePkg/Library/UefiBootManagerLib/UefiBootManagerLib.inf
    <PcdsPatchableInModule>
      gEfiMdeModulePkgTokenSpaceGuid.PcdBootDiscoveryPolicy|0x01
    <BuildOptions>
      INTEL:*_*_*_CC_FLAGS = /D BOOT_OPTION_OVERRIDE
  }

[UserExtensions.TianoCore."ExtraFiles"]
  PlatformExtra.uni

[UserExtensions.MyVendor.CustomTool]
  CUSTOM_GUID_A = 9A6A1234-ABCD-4321-8888-A1B2C3D4E5F6
  CUSTOM_PATH   = /Path/To/Custom/Metadata
