/* C99, boot từ Flash; STM32F103C8T6: Flash 64 KiB, RAM 20 KiB. */
ENTRY(Reset_Handler)

MEMORY
{
    FLASH (rx)  : ORIGIN = 0x08000000, LENGTH = 64K
    RAM   (rwx) : ORIGIN = 0x20000000, LENGTH = 20K
}

_estack = ORIGIN(RAM) + LENGTH(RAM);
_stack_size = 0x400; /* Ngân sách MSP ban đầu: 1 KiB. */
_stack_limit = _estack - _stack_size;

SECTIONS
{
    .isr_vector ORIGIN(FLASH) :
    {
        KEEP(*(.isr_vector))
        . = ALIGN(4);
    } > FLASH

    .text :
    {
        *(.text .text.*)
        *(.rodata .rodata.*)
        . = ALIGN(4);
    } > FLASH

    .ARM.extab : { *(.ARM.extab* .gnu.linkonce.armextab.*) } > FLASH
    .ARM.exidx :
    {
        __exidx_start = .;
        *(.ARM.exidx* .gnu.linkonce.armexidx.*)
        __exidx_end = .;
    } > FLASH

    /* Báo lỗi nếu thư viện đòi constructor mà startup chưa hỗ trợ. */
    .unsupported_init :
    {
        KEEP(*(.preinit_array* .init_array* .fini_array* .ctors* .dtors*))
        KEEP(*(.init .fini))
    } > FLASH

    .data :
    {
        . = ALIGN(4);
        _sdata = .;
        *(.data .data.*)
        . = ALIGN(4);
        _edata = .;
    } > RAM AT> FLASH
    _sidata = LOADADDR(.data);

    .bss (NOLOAD) :
    {
        . = ALIGN(4);
        _sbss = .;
        *(.bss .bss.*)
        *(COMMON)
        . = ALIGN(4);
        _ebss = .;
    } > RAM

    /* Stack đặt ở đỉnh RAM, tăng xuống dưới; không tạo heap C. */
    .stack _stack_limit (NOLOAD) :
    {
        . = . + _stack_size;
    } > RAM

    .ARM.attributes 0 : { *(.ARM.attributes) }

    ASSERT((_estack % 8) == 0, "MSP must be 8-byte aligned")
    ASSERT(_ebss <= _stack_limit, "RAM data overlaps reserved MSP stack")
    ASSERT(SIZEOF(.isr_vector) == (16 + 43) * 4, "Unexpected vector table size")
    ASSERT(SIZEOF(.unsupported_init) == 0, "Startup supports C99 without constructors only")
}
