<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcastNow;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ShelfEvent implements ShouldBroadcastNow
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public bool $success;
    public string $message;
    public string $action;
    public $shelf;
    public array $shelves;

    public function __construct(bool $success, string $message, string $action, $shelf = null, array $shelves = [])
    {
        $this->success = $success;
        $this->message = $message;
        $this->action  = $action;
        $this->shelf   = $shelf;
        $this->shelves = $shelves;
    }

    public function broadcastOn(): Channel
    {
        return new Channel('reverb');
    }

    public function broadcastWith(): array
    {
        return [
            'success' => $this->success,
            'message' => $this->message,
            'action'  => $this->action,
            'shelf'   => $this->shelf ? $this->shelf->toArray() : null,
            'shelves' => $this->shelves,
        ];
    }
}
