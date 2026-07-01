#==============================================================================
#
#  ## @file
#  Syntax Extension Test DSC File base on EDK II DSC File Spec. v1.30(draft).
#
#==============================================================================

!error DO NOT include this DSC file
!ErroR "DO NOT include this DSC file"  # commnet

!include MdePkg/MdePkgLibs.dsc
!Include MdePkg/MdePkgLIBS.dsc

[Defines]
  DSC_SPECIFICATION              = 1.30
  PLATFORM_NAME                  = TestPlatform
  PLATFORM_GUID                  = 12345678-ABCD-4321-8888-A1B2C3D4E5F6
  PLATFORM_VERSION               = 0.1
  OUTPUT_DIRECTORY               = Build/TestPlatform
  SUPPORTED_ARCHITECTURES        = IA32|X64
  BUILD_TARGETS                  = DEBUG|RELEASE
  SKUID_IDENTIFIER               = NewSkuId2
  FLASH_DEFINITION               = TestPlatform.fdf
  PCD_INFO_GENERATION            = TRUE

  DEFINE TARGET_VER              = 0.2.0
  DEFINE SECURE_ENABLE           = TRUE
  DEFINE COMPILER_SET            = "GCC"
  DEFINE UNICODE_STRING          = L"STR"
  DEFINE GUID_A                  = 9A6A1234-ABCD-4321-8888-A1B2C3D4E5F6

!include MdePkg/Define.dsc.inc # define inc

[SkuIds]
  0|DEFAULT
  0x01|NewSkuId1
  0x02|NewSkuId2|DEFAULT   # NewSkuId2 inherits DEFAULT setting.

[LibraryClasses.common]
  BaseLib|MdePkg/Library/BaseLib/BaseLib.inf
  TimerLib|MdePkg/Library/BaseTimerLib/BaseTimerLib.inf

[LibraryClasses.ia32, libraryClasses.X64]
!if $(TOOL_CHAIN_TAG) == VS2019 or $(TOOL_CHAIN_TAG) == VS2022 or $(TOOL_CHAIN_TAG) == VS2026
  CpuLib|UefiCpuPkg/Library/CpuLib/CpuLib.inf
!endif

[PcdsFixedAtBuild.common]  # commet
  gEfiMdePkgTokenSpaceGuid.PcdDebugPrintErrorLevel|0x80000000  # commet

[PcdsFeatureFlag.X64, pcdsFixedAtBuild.x64]
  gEfiMdePkgTokenSpaceGuid.PcdVerifyNodeEnable|TRUE

[PcdsPatchableInModule.common]
  gEfiMdePkgTokenSpaceGuid.PcdPatchableDirection|0x00

[PcdsDynamicDefault.IA32|Default, PcdsDynamicExDefault.IA32|Default]
  # TokenSpaceGuid.PcdCname|<Value>
  gEfiMdePkgTokenSpaceGuid.PcdsDynamicDefault2|0x0
  gEfiMdePkgTokenSpaceGuid.PcdDynamicExValue|0  # BOOLEAN

  # TokenSpaceGuid.PcdCname|<Value>|VOID*|<MaxSize>
  gEfiMdePkgTokenSpaceGuid.PcdsDynamicDefault|"12345"|VOID*|10

[PcdsDynamicVpd.common.NewSkuId1|NewSkuId2]
  # TokenSpaceGuid.PcdCname|<Offset>|<Value>
  gEfiMdePkgTokenSpaceGuid.PcdsDynamicVpd1|0x00|0x01

  # TokenSpaceGuid.PcdCname|<Offset>|<MaxSize>|<Value>
  gEfiMdePkgTokenSpaceGuid.PcdsDynamicVpd2|0x1|64|"None"
  gEfiMdePkgTokenSpaceGuid.PcdsDynamicVpd3|0x22C2|18|{0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF,0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF, 0xFF}

[PcdsDynamicHii.IA32, PcdsDynamicHii.X64.NewSkuId2]
  # TokenSpaceGuid.PcdCname|<HiiString>|<VariableGuid>|<VariableOffset>|<Value>|<Attribute>
  gEfiMdePkgTokenSpaceGuid.PcdEepromExData|L"Test"|gTestFormSetGuid|0x83|0x0
  gEfiMdePkgTokenSpaceGuid.PcdsDynamicHiiTimeOut|L"Timeout"|gTestFormSetGuid|0x0|BS,RT,NV  # Variable: L"Timeout"

!include MdePkg/MdePkgLibs.dsc  # commet

[Components]
  MdePkg/Application/HelloWorld/HelloWorld.inf EXEC = exe2bin.exe

  MdePkg/Application/HelloWorld/HelloWorld.inf {
    <Defines>
      FILE_GUID = $(GUID_A)
      FILE_GUID = 9A6A1234-ABCD-4321-8888-A1B2C3D4E5F6
    <LibraryClasses>
      TimerLib|MdePkg/Library/BaseTimerLib/BaseTimerLib.inf
    <PcdsFeatureFlag>
      gEfiMdePkgTokenSpaceGuid.PcdVerifyNodeEnable|FALSE
    <PcdsFixedAtBuild>
      gEfiMdePkgTokenSpaceGuid.PcdDebugPrintErrorLevel|0x0000000F
    <PcdsPatchableInModule>
      gEfiMdePkgTokenSpaceGuid.PcdPatchableDirection|0x01
    <BuildOptions>
      MSFT:*_*_*_CC_FLAGS = /D MODULE_LOCAL_OVERRIDE
      GCC:*_*_*_CC_FLAGS = -DMODULE_LOCAL_OVERRIDE
  }

!if $(BUILD_TARGET) == "DEBUG" && $(SECURE_ENABLE) == TRUE
[BuildOptions.common]
  MSFT:*_*_*_CC_FLAGS = /D DEBUG_MODE /D SECURE_ON
!elseif $(BUILD_TARGET) == "RELEASE" || $(TARGET_VER) >= 2
[BuildOptions.common]
  MSFT:*_*_*_CC_FLAGS = /D RELEASE_MODE
!elseif !$(SECURE_ENABLE)
[BuildOptions.common]
  MSFT:*_*_*_CC_FLAGS = /D INSECURE_MODE
!elseif $(TARGET_VER) != 0 && $(TARGET_VER) < 5
[BuildOptions.common]
  MSFT:*_*_*_CC_FLAGS = /D EXPERIMENTAL_MODE
!elseif $(TARGET_VER) <= 1
[BuildOptions.common]
  MSFT:*_*_*_CC_FLAGS = /D LEGACY_MODE
!elseif $(COMPILER_SET) not in "GCC, CLANG"
[BuildOptions.common]
  GCC:*_*_*_CC_FLAGS = -DOPEN_SOURCE_COMPILER
!error "Unsupported configuration combination detected!"
!elseif
   GCC:*_*_*_CC_FLAGS = -DOPEN_SOURCE_COMPILER
  !error CRYPTO_TEST_TYPE must be set to one of OPENSSL MBEDTLS.
!endif

[UserExtensions.TianoCore."ExtraFiles"]
  PlatformExtra.uni

[UserExtensions.MyVendor.CustomTool]
  CUSTOM_GUID_A = 9A6A1234-ABCD-4321-8888-A1B2C3D4E5F6
  CUSTOM_PATH   = /Path/To/Custom/Metadata

[DefaultStores]
  0 | Standard        # UEFI Standard default
  1 | Manufacturing   # UEFI Manufacturing default
