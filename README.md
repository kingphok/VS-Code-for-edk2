# VS-Code-for-edk2

VS Code Extension for reading EDK2 Language easily.

*See more. Think bigger.*

More detail information in https://hackmd.io/@kingphok/SyZZAX3SMg

---
## Specific Features
- No need to build EDK2 code before using the extension
- Built exclusively on standard VS Code APIs with no third-party npm dependencies, external binaries, or LSP servers.
- Provides Go to Definition (F12) **[Workspace Required]**
    - Requires saving and opening the project as a `.code-workspace` file to enable this feature.
    - Automatically indexs database every time open the workspace.
    - Dynamically re-indexes files as they change (including after git checkout)
    - Supports custom file associations for EDK2 languages
    - Leverages `.gitignore` settings to exclude files or paths from the Workspace.
- Provides an outline view for sections and VFR varids


## Screenshot
- Notification for indexing completed
![Example-Notification](https://raw.githubusercontent.com/kingphok/VS-Code-for-edk2/refs/heads/main/datasets/screenshot/Example-Notification.png)
- Go to definition - F12 example for PCD
![Example-GoToDefinition_Compiler_Flag](https://raw.githubusercontent.com/kingphok/VS-Code-for-edk2/refs/heads/main/datasets/screenshot/Example-GoToDefinition_Compiler_Flag.png)
- Go to definition - F12 example for Guid
![Example-GoToDefinition_EDK2_DEFINE](https://raw.githubusercontent.com/kingphok/VS-Code-for-edk2/refs/heads/main/datasets/screenshot/Example-GoToDefinition_EDK2_DEFINE.png)
- Go to definition - F12 example for PCD
![Example-GoToDefinition_Pcd](https://raw.githubusercontent.com/kingphok/VS-Code-for-edk2/refs/heads/main/datasets/screenshot/Example-GoToDefinition_Pcd.png)
- Go to definition - F12 example for Guid
![Example-GoToDefinition_Guid](https://raw.githubusercontent.com/kingphok/VS-Code-for-edk2/refs/heads/main/datasets/screenshot/Example-GoToDefinition_Guid.png)
- Outline view example for Section
![Example-Outline_Section](https://raw.githubusercontent.com/kingphok/VS-Code-for-edk2/refs/heads/main/datasets/screenshot/Example-Outline_Section.png)
- Outline view example for VFR varid
![Example-Outline_VFR_varid](https://raw.githubusercontent.com/kingphok/VS-Code-for-edk2/refs/heads/main/datasets/screenshot/Example-Outline_VFR_varid.png)


---
## Go to definition - F12 supported name List
| Name                | Caller Language (For Go to Definition - F12)    | Definition Language (For Indexing) |
| ------------------- | ----------------------------------------------- | ---------------------------------- |
| Compiler Flag       | ASL, ASM, C, edk2vfr                            | edk2dsc, edk2inf                   |
| EDK2 DEFINE         | edk2dec, edk2dsc, edk2fdf, edk2inf              | edk2dec, edk2dsc, edk2fdf, edk2inf |
| HII Image Token     | C                                               | edk2idf                            |
| HII String Token    | C, edk2vfr                                      | edk2uni                            |
| PCD                | ASL, ASM, C, edk2dec, edk2dsc, edk2fdf, edk2inf | edk2dec, edk2dsc, edk2fdf, edk2inf |
| Protocol Ppi Guid   | C, edk2dec, edk2dsc, edk2fdf, edk2inf, edk2vfr  | edk2dec                            |
| VFR goto form       | edk2vfr                                         | edk2vfr                            |
| VFR key             | C                                               | edk2vfr                            |
| VFR Varable default | C                                               | edk2vfr                            |


## Outline supported name List
| Name    | Language                           |
| ------- | ---------------------------------- |
| section | edk2dec, edk2dsc, edk2fdf, edk2inf |
| varid   | edk2vfr                            |

## Language extension file name List
| Language | File Extensions         |
| -------- | ----------------------- |
| edk2dec  | .dec                    |
| edk2dsc  | .dsc .dsc.inc .template |
| edk2fdf  | .fdf .fdf.inc           |
| edk2idf  | .idf                    |
| edk2inf  | .inf                    |
| edk2uni  | .uni .UNI               |
| edk2vfr  | .vfr .vfi .hfr          |
| *ASL     | .asi .asl .aslc         |
| *ASM     | .asm .nasm .nasmb .S    |
| *C       | .aslc .c .cpp .h        |

*\* Grammars have not been implemented for this language.*